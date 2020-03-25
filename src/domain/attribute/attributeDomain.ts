import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {IAttribute, IOAllowedTypes} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IPermissionDomain} from '../permission/permissionDomain';
import {getActionsListToSave, getAllowedInputTypes, getAllowedOutputTypes} from './helpers/attributeALHelper';
import {validateAttributeData} from './helpers/attributeValidationHelper';

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
    return {
        async getAttributeProperties(id: string): Promise<IAttribute> {
            const attrs = await attributeRepo.getAttributes({filters: {id}, strictFilters: true});

            if (!attrs.list.length) {
                throw new ValidationError<IAttribute>({id: Errors.UNKNOWN_ATTRIBUTE});
            }
            const props = attrs.list.pop();

            return props;
        },
        async getAttributes(params?: IGetCoreEntitiesParams): Promise<IList<IAttribute>> {
            // TODO: possibility to search multiple IDs
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

            const defaultParams = {
                _key: '',
                system: false,
                multiple_values: false,
                values_list: {
                    enable: false
                }
            };

            const attrProps: IAttribute = attrs.list[0] ?? null;
            const attrToSave = isExistingAttr
                ? {
                      ...defaultParams,
                      ...attrProps,
                      ...attrData
                  }
                : {...defaultParams, ...attrData};

            // Check permissions
            const action = isExistingAttr
                ? AdminPermissionsActions.EDIT_ATTRIBUTE
                : AdminPermissionsActions.CREATE_ATTRIBUTE;
            const canSavePermission = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            // Add default actions list on new attribute
            attrToSave.actions_list = getActionsListToSave(attrToSave, attrProps, !isExistingAttr, utils);

            // Check settings validity
            const validationErrors = await validateAttributeData(attrToSave, {
                utils,
                treeRepo,
                config,
                attributeRepo,
                actionsListDomain
            });

            if (Object.keys(validationErrors).length) {
                throw new ValidationError<IAttribute>(validationErrors);
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
                throw new ValidationError<IAttribute>({id: Errors.UNKNOWN_ATTRIBUTE});
            }

            const attrProps = attr.list.pop();

            if (attrProps.system) {
                throw new ValidationError<IAttribute>({id: Errors.SYSTEM_ATTRIBUTE_DELETION});
            }

            return attributeRepo.deleteAttribute(attrProps);
        },
        getInputTypes(attrData: IAttribute): IOAllowedTypes {
            return getAllowedInputTypes(attrData);
        },
        getOutputTypes(attrData: IAttribute): IOAllowedTypes {
            return getAllowedOutputTypes(attrData);
        }
    };
}
