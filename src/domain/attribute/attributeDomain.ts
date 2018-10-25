import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ActionsListEvents, ActionsListIOTypes, IActionsListConfig} from '../../_types/actionsList';
import {AttributeFormats, IAttribute, IAttributeFilterOptions} from '../../_types/attribute';
import {AdminPermisisonsActions} from '../../_types/permissions';
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
    getAttributes(filters?: IAttributeFilterOptions): Promise<IAttribute[]>;

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
    permissionDomain: IPermissionDomain = null
): IAttributeDomain {
    function _getDefaultActionsList(attribute: IAttribute): IActionsListConfig {
        // TODO: save defaults action on attribute creation

        switch (attribute.format) {
            case AttributeFormats.DATE:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'toNumber',
                            isSystem: true
                        },
                        {
                            name: 'validateFormat',
                            isSystem: true
                        }
                    ]
                };
            case AttributeFormats.ENCRYPTED:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'validateFormat',
                            isSystem: true
                        },
                        {
                            name: 'encrypt',
                            isSystem: true
                        }
                    ],
                    [ActionsListEvents.GET_VALUE]: [
                        {
                            name: 'toBoolean',
                            isSystem: true
                        }
                    ]
                };
            case AttributeFormats.EXTENDED:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'parseJSON',
                            isSystem: true
                        },
                        {
                            name: 'validateFormat',
                            isSystem: true
                        },
                        {
                            name: 'toJSON',
                            isSystem: true
                        }
                    ]
                };
            default:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'validateFormat',
                            isSystem: true
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
        const saveValueActions = attrData.actions_list[ActionsListEvents.SAVE_VALUE];
        const lastAction = saveValueActions.slice(-1)[0];
        const lastActionDetails = availableActions.find(a => a.name === lastAction.name);
        const allowedInputType = _getAllowedInputType(attrData);

        if (lastActionDetails.outputTypes.indexOf(allowedInputType) === -1) {
            throw new ValidationError({
                'actions_list.saveValue': `Last action is invalid:
                    expected action with ouptput types including ${allowedInputType},
                    received ${lastActionDetails.outputTypes}`
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
                if (defAction.isSystem && !attrData.actions_list[event].find(a => a.name === defAction.name)) {
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
            const attrs = await attributeRepo.getAttributes({id}, true);

            if (!attrs.length) {
                throw new ValidationError({id: 'Unknown attribute ' + id});
            }
            const props = attrs.pop();

            return props;
        },
        async getAttributes(filters?: IAttributeFilterOptions): Promise<IAttribute[]> {
            const attrs = await attributeRepo.getAttributes(filters);

            return attrs;
        },
        async saveAttribute(attrData: IAttribute, infos: IQueryInfos): Promise<IAttribute> {
            // TODO: Validate attribute data (linked library, linked tree...)

            const attrs = await attributeRepo.getAttributes({id: attrData.id});
            const isExistingAttr = !!attrs.length;

            // Check permissions
            const action = isExistingAttr
                ? AdminPermisisonsActions.EDIT_ATTRIBUTE
                : AdminPermisisonsActions.CREATE_ATTRIBUTE;
            const canSavePermission = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            const attrToSave = {...attrData};
            attrToSave.actions_list =
                !isExistingAttr && typeof attrToSave.actions_list === 'undefined'
                    ? _getDefaultActionsList(attrData)
                    : typeof attrToSave.actions_list !== 'undefined'
                        ? attrToSave.actions_list
                        : null;

            // Check output type of last action
            _validateInputType(attrToSave);

            // Check presence of system actions
            _validateRequiredActions(attrToSave);

            const attr = isExistingAttr
                ? await attributeRepo.updateAttribute(attrToSave)
                : await attributeRepo.createAttribute(attrToSave);

            return attr;
        },
        async deleteAttribute(id: string, infos: IQueryInfos): Promise<IAttribute> {
            // Check permissions
            const action = AdminPermisisonsActions.DELETE_ATTRIBUTE;
            const canSavePermission = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            // Get attribute
            const attr = await this.getAttributes({id});

            // Check if exists and can delete
            if (!attr.length) {
                throw new ValidationError({id: 'Unknown attribute ' + id});
            }

            const attrProps = attr.pop();

            if (attrProps.system) {
                throw new ValidationError({id: 'Cannot delete system attribute'});
            }

            return attributeRepo.deleteAttribute(attrProps);
        }
    };
}
