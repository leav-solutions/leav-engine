import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {difference} from 'lodash';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ActionsListEvents, ActionsListIOTypes, IActionsListConfig} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
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
}

export default function(
    attributeRepo: IAttributeRepo = null,
    actionsListDomain: IActionsListDomain = null,
    permissionDomain: IPermissionDomain = null,
    utils: IUtils = null,
    treeRepo: ITreeRepo = null
): IAttributeDomain {
    function _getDefaultActionsList(attribute: IAttribute): IActionsListConfig {
        // TODO: save defaults action on attribute creation

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

    function _getAllowedInputType(attribute: IAttribute): ActionsListIOTypes {
        // TODO: check actions list on attribute save

        switch (attribute.format) {
            case AttributeFormats.NUMERIC:
            case AttributeFormats.DATE:
                return ActionsListIOTypes.NUMBER;
            case AttributeFormats.BOOLEAN:
                return ActionsListIOTypes.BOOLEAN;
            default:
                return ActionsListIOTypes.STRING;
        }
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
        if (!attrData.actions_list || !attrData.actions_list[ActionsListEvents.SAVE_VALUE]) {
            return;
        }

        const availableActions = actionsListDomain.getAvailableActions();
        const saveValueActions = attrData.actions_list[ActionsListEvents.SAVE_VALUE];
        const lastAction = saveValueActions.slice(-1)[0];
        const lastActionDetails = availableActions.find(a => a.name === lastAction.name);
        const allowedInputType = _getAllowedInputType(attrData);

        if (lastActionDetails.output_types.indexOf(allowedInputType) === -1) {
            throw new ValidationError({
                'actions_list.saveValue': `Last action is invalid:
                    expected action with ouptput types including ${allowedInputType},
                    received ${lastActionDetails.output_types}`
            });
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
            const attrToSave = {...attrData};

            // Check permissions
            const action = isExistingAttr
                ? AdminPermissionsActions.EDIT_ATTRIBUTE
                : AdminPermissionsActions.CREATE_ATTRIBUTE;
            const canSavePermission = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            // Add default actions list on new attribute
            attrToSave.actions_list =
                !isExistingAttr && typeof attrToSave.actions_list === 'undefined'
                    ? _getDefaultActionsList(attrData)
                    : typeof attrToSave.actions_list !== 'undefined'
                    ? attrToSave.actions_list
                    : null;

            // Check settings validity
            const validationErrors = await _validateAttributeData(attrData);

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
        }
    };
}
