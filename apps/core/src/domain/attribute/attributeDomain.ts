// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAppPermissionDomain} from 'domain/permission/appPermissionDomain';
import getPermissionCachePatternKey from '../permission/helpers/getPermissionCachePatternKey';
import {IAttributeForRepo, IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {IDateRangeValue} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AttributeFormats, IAttribute, IGetCoreAttributesParams, IOAllowedTypes} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {IList, SortOrder} from '../../_types/list';
import {AppPermissionsActions, PermissionTypes} from '../../_types/permissions';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {getActionsListToSave, getAllowedInputTypes, getAllowedOutputTypes} from './helpers/attributeALHelper';
import {validateAttributeData} from './helpers/attributeValidationHelper';
import {ECacheType, ICachesService} from '../../infra/cache/cacheService';

export interface IAttributeDomain {
    getAttributeProperties({id, ctx}: {id: string; ctx: IQueryInfos}): Promise<IAttribute>;

    /**
     * Get attributes list, filtered or not
     */
    getAttributes({params, ctx}: {params?: IGetCoreAttributesParams; ctx: IQueryInfos}): Promise<IList<IAttribute>>;

    /**
     * Save attribute.
     * If attribute doesn't exist => create a new one, otherwise update existing
     */
    saveAttribute({attrData, ctx}: {attrData: IAttribute; ctx: IQueryInfos}): Promise<IAttribute>;
    deleteAttribute({id, ctx}: {id: string; ctx: IQueryInfos}): Promise<IAttribute>;
    getInputTypes({attrData, ctx}: {attrData: IAttribute; ctx: IQueryInfos}): IOAllowedTypes;
    getOutputTypes({attrData, ctx}: {attrData: IAttribute; ctx: IQueryInfos}): IOAllowedTypes;
    getLibraryAttributes(libraryId: string, ctx: IQueryInfos): Promise<IAttribute[]>;
    getLibraryFullTextAttributes(libraryId: string, ctx: IQueryInfos): Promise<IAttribute[]>;
}

interface IDeps {
    'core.infra.attribute'?: IAttributeRepo;
    'core.domain.actionsList'?: IActionsListDomain;
    'core.domain.permission.app'?: IAppPermissionDomain;
    'core.infra.library'?: ILibraryRepo;
    'core.utils'?: IUtils;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.cache.cacheService'?: ICachesService;
    config?: any;
}

export default function ({
    'core.infra.attribute': attributeRepo = null,
    'core.domain.actionsList': actionsListDomain = null,
    'core.domain.permission.app': appPermissionDomain = null,
    'core.infra.library': libraryRepo = null,
    'core.utils': utils = null,
    'core.infra.tree': treeRepo = null,
    config = null,
    'core.infra.cache.cacheService': cacheService = null
}: IDeps = {}): IAttributeDomain {
    return {
        async getLibraryAttributes(libraryId: string, ctx): Promise<IAttribute[]> {
            const libs = await libraryRepo.getLibraries({params: {filters: {id: libraryId}}, ctx});

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            return attributeRepo.getLibraryAttributes({libraryId, ctx});
        },
        async getLibraryFullTextAttributes(libraryId: string, ctx): Promise<IAttribute[]> {
            const libs = await libraryRepo.getLibraries({params: {filters: {id: libraryId}}, ctx});

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            return attributeRepo.getLibraryFullTextAttributes({libraryId, ctx});
        },
        async getAttributeProperties({id, ctx}): Promise<IAttribute> {
            const attrs = await attributeRepo.getAttributes({
                params: {filters: {id}, strictFilters: true},
                ctx
            });

            if (!attrs.list.length) {
                throw new ValidationError<IAttribute>({id: {msg: Errors.UNKNOWN_ATTRIBUTE, vars: {attribute: id}}});
            }
            const props = attrs.list.pop();

            return props;
        },
        async getAttributes({
            params,
            ctx
        }: {
            params?: IGetCoreAttributesParams;
            ctx: IQueryInfos;
        }): Promise<IList<IAttribute>> {
            // TODO: possibility to search multiple IDs
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return attributeRepo.getAttributes({params: initializedParams, ctx});
        },
        async saveAttribute({attrData, ctx}): Promise<IAttribute> {
            // TODO: Validate attribute data (linked library, linked tree...)

            const attrs = await attributeRepo.getAttributes({
                params: {filters: {id: attrData.id}, strictFilters: true},
                ctx
            });
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
            const attrToSave: IAttributeForRepo = isExistingAttr
                ? {
                      ...defaultParams,
                      ...attrProps,
                      ...attrData
                  }
                : {...defaultParams, ...attrData};

            // Check permissions
            const action = isExistingAttr
                ? AppPermissionsActions.EDIT_ATTRIBUTE
                : AppPermissionsActions.CREATE_ATTRIBUTE;
            const canSavePermission = await appPermissionDomain.getAppPermission({action, userId: ctx.userId, ctx});

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            // Add default actions list on new attribute
            attrToSave.actions_list = getActionsListToSave(attrToSave, attrProps, !isExistingAttr, utils);

            // Check settings validity
            const validationErrors = await validateAttributeData(
                attrToSave,
                {
                    utils,
                    treeRepo,
                    config,
                    attributeRepo,
                    actionsListDomain
                },
                ctx
            );

            if (Object.keys(validationErrors).length) {
                throw new ValidationError<IAttribute>(validationErrors);
            }

            if (attrToSave.format === AttributeFormats.DATE_RANGE && attrToSave.values_list?.values?.length) {
                attrToSave.values_list.values = (attrToSave.values_list.values as Array<string | IDateRangeValue>).map(
                    (v): IDateRangeValue<number> => {
                        const valuesObj: IDateRangeValue = typeof v !== 'object' ? JSON.parse(v) : v;

                        // Extract the precise fields we need to make sure
                        // we don't have something else hanging out (eg. a __typename field)
                        return {from: Number(valuesObj.from), to: Number(valuesObj.to)};
                    }
                );
            }

            // If permissions conf changed we clean cache related to this attribute.
            if (
                isExistingAttr &&
                JSON.stringify(attrData.permissions_conf?.permissionTreeAttributes) !==
                    JSON.stringify(attrProps.permissions_conf?.permissionTreeAttributes)
            ) {
                const keyAttr = getPermissionCachePatternKey({
                    permissionType: PermissionTypes.ATTRIBUTE,
                    applyTo: attrProps.id
                });
                const keyRecAttr = getPermissionCachePatternKey({
                    permissionType: PermissionTypes.RECORD_ATTRIBUTE,
                    applyTo: attrProps.id
                });

                await cacheService.getCache(ECacheType.RAM).deleteData([keyAttr, keyRecAttr]);
            }

            const attr = isExistingAttr
                ? await attributeRepo.updateAttribute({attrData: attrToSave, ctx})
                : await attributeRepo.createAttribute({attrData: attrToSave, ctx});

            return attr;
        },
        async deleteAttribute({id, ctx}): Promise<IAttribute> {
            // Check permissions
            const action = AppPermissionsActions.DELETE_ATTRIBUTE;
            const canSavePermission = await appPermissionDomain.getAppPermission({action, userId: ctx.userId, ctx});

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            // Get attribute
            const attr = await this.getAttributes({params: {filters: {id}}, ctx});

            // Check if exists and can delete
            if (!attr.list.length) {
                throw new ValidationError<IAttribute>({id: Errors.UNKNOWN_ATTRIBUTE});
            }

            const attrProps = attr.list.pop();

            if (attrProps.system) {
                throw new ValidationError<IAttribute>({id: Errors.SYSTEM_ATTRIBUTE_DELETION});
            }

            return attributeRepo.deleteAttribute({attrData: attrProps, ctx});
        },
        getInputTypes({attrData}): IOAllowedTypes {
            return getAllowedInputTypes(attrData);
        },
        getOutputTypes({attrData}): IOAllowedTypes {
            return getAllowedOutputTypes(attrData);
        }
    };
}
