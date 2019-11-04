import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {difference, intersection} from 'lodash';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError, {IValidationErrorFieldDetail} from '../../errors/ValidationError';
import {ActionsListEvents, ActionsListIOTypes, IActionsListConfig} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute, IOAllowedTypes} from '../../_types/attribute';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IPermissionDomain} from '../permission/permissionDomain';

export interface IAttributeDomain {
    /**
     * Get attribute properties
     *
     * @param id
     * @returns Promise<{}>
     */
    getAttributeProperties(id: string): Promise<IAttribute>;

    /**
     * Get attributes list, filtered or not
     *
     * @param filters
     * @returns Promise<[{}]>
     */
    getAttributes(params?: IGetCoreEntitiesParams): Promise<IList<IAttribute>>;

    /**
     * Save attribute.
     * If attribute doesn't exist => create a new one, otherwise update existing
     *
     * @param {} attrData
     * @return Promise<{}>  Saved attribute
     */
    saveAttribute(attrData: IAttribute, infos: IQueryInfos): Promise<IAttribute>;

    /**
     * Delete an attribute
     *
     * @param id
     */
    deleteAttribute(id: string, infos: IQueryInfos): Promise<IAttribute>;

    getInputTypes(attrData: IAttribute): IOAllowedTypes;

    getOutputTypes(attrData: IAttribute): IOAllowedTypes;
}

interface IDeps {
    'core.infra.attribute'?: IAttributeRepo;
    'core.domain.actionsList'?: IActionsListDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.utils'?: IUtils;
    'core.infra.tree'?: ITreeRepo;
    config?: any;
}

export default function({
    'core.infra.attribute': attributeRepo = null,
    'core.domain.actionsList': actionsListDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.utils': utils = null,
    'core.infra.tree': treeRepo = null,
    config = null
}: IDeps = {}): IAttributeDomain {
    function _getDefaultActionsList(attribute: IAttribute): IActionsListConfig {
        if (attribute.type !== AttributeTypes.SIMPLE && attribute.type !== AttributeTypes.ADVANCED) {
            return {};
        }

        switch (attribute.format) {
            case AttributeFormats.DATE:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'toNumber',
                            is_system: true
                        },
                        {
                            name: 'validateFormat',
                            is_system: true
                        }
                    ],
                    [ActionsListEvents.GET_VALUE]: [
                        {
                            name: 'formatDate',
                            is_system: false
                        }
                    ]
                };
            case AttributeFormats.ENCRYPTED:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'validateFormat',
                            is_system: true
                        },
                        {
                            name: 'encrypt',
                            is_system: true
                        }
                    ],
                    [ActionsListEvents.GET_VALUE]: [
                        {
                            name: 'toBoolean',
                            is_system: true
                        }
                    ]
                };
            case AttributeFormats.EXTENDED:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'parseJSON',
                            is_system: true
                        },
                        {
                            name: 'validateFormat',
                            is_system: true
                        },
                        {
                            name: 'toJSON',
                            is_system: true
                        }
                    ]
                };
            default:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'validateFormat',
                            is_system: true
                        }
                    ]
                };
        }
    }

    function _getAllowedInputTypes(attribute: IAttribute): IOAllowedTypes {
        let inputTypes;
        switch (attribute.format) {
            case AttributeFormats.NUMERIC:
            case AttributeFormats.DATE:
                inputTypes = {
                    [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                    [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.NUMBER],
                    [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
                };
                break;
            case AttributeFormats.BOOLEAN:
                inputTypes = {
                    [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.BOOLEAN],
                    [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.BOOLEAN],
                    [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.BOOLEAN]
                };
                break;
            default:
                inputTypes = {
                    [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                    [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.STRING],
                    [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
                };
                break;
        }

        return inputTypes;
    }

    function _getAllowedOutputTypes(attribute: IAttribute): IOAllowedTypes {
        let outputTypes;
        switch (attribute.format) {
            case AttributeFormats.NUMERIC:
            case AttributeFormats.DATE:
                outputTypes = {
                    [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                    [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
                };
                break;
            case AttributeFormats.BOOLEAN:
                outputTypes = {
                    [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.BOOLEAN],
                    [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.BOOLEAN]
                };
                break;
            default:
                outputTypes = {
                    [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                    [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
                };
                break;
        }
        outputTypes[ActionsListEvents.GET_VALUE] = Object.values(ActionsListIOTypes);

        return outputTypes;
    }

    async function _validateAttributeData(attrData: IAttribute): Promise<{}> {
        const errors = {} as any;

        if (!utils.validateID(attrData.id)) {
            errors.id = 'Invalid ID format: ' + attrData.id;
        }

        if (
            (attrData.type === AttributeTypes.SIMPLE || attrData.type === AttributeTypes.SIMPLE_LINK) &&
            attrData.multiple_values
        ) {
            errors.multiple_values = 'Multiple values not allowed for this attribute type';
        }

        if (
            attrData.versions_conf &&
            attrData.versions_conf.versionable &&
            attrData.versions_conf.trees &&
            attrData.versions_conf.trees.length
        ) {
            const existingTrees = await treeRepo.getTrees();
            const unknownTrees = difference(attrData.versions_conf.trees, existingTrees.list.map(a => a.id));
            if (unknownTrees.length) {
                errors.versions_conf = `Unknown trees: ${unknownTrees.join(', ')}`;
            }
        }

        // Check output type of last action
        _validateInputType(attrData);

        // Check presence of system actions
        _validateRequiredActions(attrData);

        return errors;
    }

    /**
     * Check if last actions's output type matches attribute allowed input type
     *
     * @param attrData
     */
    function _validateInputType(attrData: IAttribute): void {
        if (!attrData.actions_list) {
            return;
        }

        const availableActions = actionsListDomain.getAvailableActions();
        const allowedInputTypes = _getAllowedOutputTypes(attrData);
        const errors: IValidationErrorFieldDetail = {};
        for (const event of Object.values(ActionsListEvents)) {
            if (!attrData.actions_list[event] || !attrData.actions_list[event].length) {
                continue;
            }

            const eventActions = attrData.actions_list[event];
            const lastAction = eventActions.slice(-1)[0];
            const lastActionDetails = availableActions.find(a => a.name === lastAction.name);

            if (!intersection(lastActionDetails.output_types, allowedInputTypes[event]).length) {
                errors[`actions_list.${event}`] = `Last action is invalid:
                        expected action with ouptput types including ${allowedInputTypes[event]},
                        received ${lastActionDetails.output_types}`;
            }
        }

        if (Object.keys(errors).length) {
            throw new ValidationError(errors);
        }
    }

    /**
     * Check if all required actions (flagged as system action) are present
     *
     * @param attrData
     */
    function _validateRequiredActions(attrData: IAttribute): void {
        if (!attrData.actions_list) {
            return;
        }

        const defaultActions = _getDefaultActionsList(attrData);
        const missingActions = [];
        for (const event of Object.keys(defaultActions)) {
            for (const defAction of defaultActions[event]) {
                if (
                    defAction.is_system &&
                    (!attrData.actions_list[event] ||
                        !attrData.actions_list[event].find(a => a.name === defAction.name))
                ) {
                    missingActions.push(`${event} => ${defAction.name}`);
                }
            }
        }

        if (missingActions.length) {
            throw new ValidationError({actions_list: `Missing required actions: ${missingActions.join(', ')}`});
        }
    }

    return {
        async getAttributeProperties(id: string): Promise<IAttribute> {
            const attrs = await attributeRepo.getAttributes({filters: {id}, strictFilters: true});

            if (!attrs.list.length) {
                throw new ValidationError({id: 'Unknown attribute ' + id});
            }
            const props = attrs.list.pop();

            return props;
        },
        async getAttributes(params?: IGetCoreEntitiesParams): Promise<IList<IAttribute>> {
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return attributeRepo.getAttributes(initializedParams);
        },
        async saveAttribute(attrData: IAttribute, infos: IQueryInfos): Promise<IAttribute> {
            // TODO: Validate attribute data (linked library, linked tree...)

            const attrs = await attributeRepo.getAttributes({filters: {id: attrData.id}, strictFilters: true});
            const isExistingAttr = !!attrs.list.length;

            const attrProps = isExistingAttr ? attrs.list[0] : {};
            const attrToSave = {...attrProps, ...attrData};

            // Check required fields
            const requiredFieldsErrors: IValidationErrorFieldDetail = {};
            if (!attrToSave.type) {
                requiredFieldsErrors.type = "Attribute's type must be specified";
            }

            if (
                (attrToSave.type === AttributeTypes.SIMPLE || attrToSave.type === AttributeTypes.ADVANCED) &&
                !attrToSave.format
            ) {
                requiredFieldsErrors.format = "Attribute's format must be specified";
            }

            if (!attrToSave.label[config.lang.default]) {
                requiredFieldsErrors.label = `Attribute's label for default language
                    (${config.lang.default}) must be specified`;
            }

            if (
                (attrToSave.type === AttributeTypes.SIMPLE_LINK || attrToSave.type === AttributeTypes.ADVANCED_LINK) &&
                !attrToSave.linked_library
            ) {
                requiredFieldsErrors.linked_library = `Attribute's linked library must be specified`;
            }

            if (attrToSave.type === AttributeTypes.TREE && !attrToSave.linked_tree) {
                requiredFieldsErrors.linked_tree = `Attribute's linked tree must be specified`;
            }

            if (Object.keys(requiredFieldsErrors).length) {
                throw new ValidationError(requiredFieldsErrors);
            }

            // Check permissions
            const action = isExistingAttr
                ? AdminPermissionsActions.EDIT_ATTRIBUTE
                : AdminPermissionsActions.CREATE_ATTRIBUTE;
            const canSavePermission = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            // Add default actions list on new attribute
            attrToSave.actions_list = !isExistingAttr
                ? utils.mergeConcat(_getDefaultActionsList(attrToSave), attrToSave.actions_list)
                : attrToSave.actions_list;

            if (!attrToSave.actions_list || !Object.keys(attrToSave.actions_list).length) {
                attrToSave.actions_list = null;
            }

            // Check settings validity
            const validationErrors = await _validateAttributeData(attrToSave);

            if (Object.keys(validationErrors).length) {
                throw new ValidationError(validationErrors);
            }

            const attr = isExistingAttr
                ? await attributeRepo.updateAttribute(attrToSave)
                : await attributeRepo.createAttribute(attrToSave);

            return attr;
        },
        async deleteAttribute(id: string, infos: IQueryInfos): Promise<IAttribute> {
            // Check permissions
            const action = AdminPermissionsActions.DELETE_ATTRIBUTE;
            const canSavePermission = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            // Get attribute
            const attr = await this.getAttributes({filters: {id}});

            // Check if exists and can delete
            if (!attr.list.length) {
                throw new ValidationError({id: 'Unknown attribute ' + id});
            }

            const attrProps = attr.list.pop();

            if (attrProps.system) {
                throw new ValidationError({id: 'Cannot delete system attribute'});
            }

            return attributeRepo.deleteAttribute(attrProps);
        },
        getInputTypes(attrData: IAttribute): IOAllowedTypes {
            return _getAllowedInputTypes(attrData);
        },
        getOutputTypes(attrData: IAttribute): IOAllowedTypes {
            return _getAllowedOutputTypes(attrData);
        }
    };
}
