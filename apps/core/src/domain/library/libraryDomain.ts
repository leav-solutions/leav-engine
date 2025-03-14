// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';
import {IValidateHelper} from 'domain/helpers/validate';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {i18n} from 'i18next';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {difference, intersection, union} from 'lodash';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {IConfig} from '_types/config';
import {ErrorFieldDetail} from '_types/errors';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import {systemPreviewsSettings} from '../../domain/filesManager/_constants';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ECacheType, ICachesService} from '../../infra/cache/cacheService';
import getDefaultAttributes from '../../utils/helpers/getLibraryDefaultAttributes';
import {Errors} from '../../_types/errors';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions, PermissionTypes} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import getPermissionCachePatternKey from '../permission/helpers/getPermissionCachePatternKey';
import {IRecordDomain} from '../record/recordDomain';
import checkSavePermission from './helpers/checkSavePermission';
import {IDeleteAssociatedValuesHelper} from './helpers/deleteAssociatedValues';
import runBehaviorPostSave from './helpers/runBehaviorPostSave';
import {RunPreDeleteFunc} from './helpers/runPreDelete';
import {IUpdateAssociatedFormsHelper} from './helpers/updateAssociatedForms';
import validateLibAttributes from './helpers/validateLibAttributes';
import validateLibFullTextAttributes from './helpers/validateLibFullTextAttributes';
import validatePermConf from './helpers/validatePermConf';
import validatePreviewsSettings from './helpers/validatePreviewsSettings';
import validateRecordIdentityConf from './helpers/validateRecordIdentityConf';

export interface ILibraryDomain {
    getLibraries({params, ctx}: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<ILibrary>>;
    saveLibrary(library: ILibrary, ctx: IQueryInfos): Promise<ILibrary>;
    deleteLibrary(id: string, ctx: IQueryInfos): Promise<ILibrary>;
    getLibraryProperties(id: string, ctx: IQueryInfos): Promise<ILibrary>;
    getLibrariesUsingAttribute(attributeId: string, ctx: IQueryInfos): Promise<string[]>;
}

export interface ILibraryDomainDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.library.helpers.deleteAssociatedValues': IDeleteAssociatedValuesHelper;
    'core.domain.library.helpers.runPreDelete': RunPreDeleteFunc;
    'core.domain.library.helpers.updateAssociatedForms': IUpdateAssociatedFormsHelper;
    'core.domain.permission.admin': IAdminPermissionDomain;
    'core.domain.record': IRecordDomain;
    'core.infra.attribute': IAttributeRepo;
    'core.infra.cache.cacheService': ICachesService;
    'core.infra.library': ILibraryRepo;
    'core.infra.tree': ITreeRepo;
    'core.utils': IUtils;
    config: IConfig;
    translator: i18n;
}

export default function ({
    'core.domain.attribute': attributeDomain,
    'core.domain.eventsManager': eventsManager,
    'core.domain.helpers.getCoreEntityById': getCoreEntityById,
    'core.domain.helpers.validate': validateHelper,
    'core.domain.library.helpers.deleteAssociatedValues': deleteAssociatedValues,
    'core.domain.library.helpers.runPreDelete': runPreDelete,
    'core.domain.library.helpers.updateAssociatedForms': updateAssociatedForms,
    'core.domain.permission.admin': adminPermissionDomain,
    'core.domain.record': recordDomain,
    'core.infra.attribute': attributeRepo,
    'core.infra.cache.cacheService': cacheService,
    'core.infra.library': libraryRepo,
    'core.infra.tree': treeRepo,
    'core.utils': utils,
    config,
    translator: translator
}: ILibraryDomainDeps): ILibraryDomain {
    return {
        async getLibraries({
            params,
            ctx
        }: {
            params?: IGetCoreEntitiesParams;
            ctx: IQueryInfos;
        }): Promise<IList<ILibrary>> {
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            const libsList = await libraryRepo.getLibraries({params: initializedParams, ctx});

            const libs = await Promise.all(
                libsList.list.map(async lib => {
                    lib.attributes = await attributeDomain.getLibraryAttributes(lib.id, ctx);
                    lib.fullTextAttributes = await attributeDomain.getLibraryFullTextAttributes(lib.id, ctx);

                    return lib;
                })
            );

            return {
                totalCount: libsList.totalCount,
                list: libs
            };
        },
        async getLibraryProperties(id: string, ctx: IQueryInfos): Promise<ILibrary> {
            if (!id) {
                throw new ValidationError({id: Errors.MISSING_LIBRARY_ID});
            }

            const lib = await getCoreEntityById<ILibrary>('library', id, ctx);

            if (!lib) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            return lib;
        },
        async getLibrariesUsingAttribute(attributeId: string, ctx: IQueryInfos): Promise<string[]> {
            const attribute = await getCoreEntityById('attribute', attributeId, ctx);

            if (!attribute) {
                throw new ValidationError<IAttribute>({id: Errors.UNKNOWN_ATTRIBUTE});
            }

            return libraryRepo.getLibrariesUsingAttribute(attributeId, ctx);
        },
        async saveLibrary(libData: ILibrary, ctx: IQueryInfos): Promise<ILibrary> {
            const library = await getCoreEntityById<ILibrary>('library', libData.id, ctx);
            const existingLib = !!library;

            const defaultParams: Partial<ILibrary> = {
                id: '',
                system: false,
                behavior: LibraryBehavior.STANDARD,
                label: {fr: '', en: ''}
            };

            // We need behavior later on for validation. It's forbidden to change it so we get it from the existing lib
            const libBehavior = existingLib ? library?.behavior : (libData?.behavior ?? defaultParams.behavior);

            // If existing lib, force all uneditable fields to value saved id DB
            // If new lib, merge default params with supplied params
            const dataToSave = existingLib
                ? {...libData, behavior: library.behavior, system: library.system}
                : {...defaultParams, ...libData};

            if (libBehavior === LibraryBehavior.FILES) {
                dataToSave.previewsSettings = [...systemPreviewsSettings, ...(libData.previewsSettings ?? [])];

                // Make sure the "system" flag is defined everywhere
                dataToSave.previewsSettings = dataToSave.previewsSettings.map(preview => ({
                    ...preview,
                    system: preview.system ?? false
                }));
            }

            const validationErrors: Array<ErrorFieldDetail<ILibrary>> = [];
            const defaultAttributes = getDefaultAttributes(dataToSave.behavior, libData.id);
            const currentLibraryAttributes = existingLib
                ? (await attributeDomain.getLibraryAttributes(libData.id, ctx)).map(a => a.id)
                : [];
            const currentFullTextAttributes = existingLib
                ? (await attributeDomain.getLibraryFullTextAttributes(libData.id, ctx)).map(a => a.id)
                : [];

            // Check permissions
            const permCheck = await checkSavePermission(existingLib, ctx.userId, {adminPermissionDomain}, ctx);
            if (!permCheck.canSave) {
                throw new PermissionError(permCheck.action);
            }

            // Validate ID format
            if (!utils.isIdValid(dataToSave.id)) {
                throw new ValidationError({id: Errors.INVALID_ID_FORMAT});
            }

            validationErrors.push(await validatePermConf(dataToSave.permissions_conf, {attributeDomain}, ctx));

            if (dataToSave.defaultView && !(await validateHelper.validateView(dataToSave.defaultView, false, ctx))) {
                validationErrors.push({
                    defaultView: Errors.UNKNOWN_VIEW
                });
            }

            // New library? Link default attributes. Otherwise, save given attributes if any
            const attributesToSave = dataToSave.attributes
                ? dataToSave.attributes.map(attr => attr.id)
                : currentLibraryAttributes;

            const fullTextAttributesToSave = dataToSave.fullTextAttributes
                ? dataToSave.fullTextAttributes.map(fta => fta.id)
                : intersection(attributesToSave, currentFullTextAttributes); // in case an attribute is deleted while indexed

            const libAttributes = union(defaultAttributes, attributesToSave);

            const libFullTextAttributes = [...new Set(fullTextAttributesToSave)];

            // We can get rid of attributes and full text attributes in lib data, it will be saved separately
            delete dataToSave.attributes;
            delete dataToSave.fullTextAttributes;

            validationErrors.push(
                await validateLibAttributes(
                    {...dataToSave, behavior: libBehavior},
                    libAttributes,
                    {attributeDomain},
                    ctx
                ),
                validateLibFullTextAttributes(
                    union(defaultAttributes, attributesToSave.length ? attributesToSave : currentLibraryAttributes),
                    libFullTextAttributes
                ),
                await validateRecordIdentityConf(
                    dataToSave as ILibrary,
                    libAttributes,
                    {
                        attributeDomain
                    },
                    ctx
                ),
                await validatePreviewsSettings(dataToSave, ctx)
            );

            // remove full text attributes if attribute is delete
            libFullTextAttributes.filter(a => libAttributes.includes(a));

            const mergedValidationErrors = validationErrors.reduce((acc, cur) => ({...acc, ...cur}), {});
            if (Object.keys(mergedValidationErrors).length) {
                throw new ValidationError(mergedValidationErrors);
            }

            // If permissions conf changed we clean cache related to this library.
            if (
                existingLib &&
                JSON.stringify(libData.permissions_conf?.permissionTreeAttributes) !==
                    JSON.stringify(library.permissions_conf?.permissionTreeAttributes)
            ) {
                const keyLib = getPermissionCachePatternKey({
                    permissionType: PermissionTypes.LIBRARY,
                    applyTo: libData.id
                });
                const keyRec = getPermissionCachePatternKey({
                    permissionType: PermissionTypes.RECORD,
                    applyTo: libData.id
                });

                await cacheService.getCache(ECacheType.RAM).deleteData([keyLib, keyRec]);
            }

            const savedLib = existingLib
                ? await libraryRepo.updateLibrary({
                      libData: dataToSave as ILibrary,
                      ctx
                  })
                : await libraryRepo.createLibrary({
                      libData: dataToSave as ILibrary,
                      ctx
                  });

            await libraryRepo.saveLibraryAttributes({
                libId: dataToSave.id,
                attributes: libAttributes,
                ctx
            });

            await libraryRepo.saveLibraryFullTextAttributes({
                libId: dataToSave.id,
                fullTextAttributes: libFullTextAttributes,
                ctx
            });

            await runBehaviorPostSave(
                savedLib,
                !existingLib,
                {treeRepo, attributeRepo, libraryRepo, translator, utils, config},
                ctx
            );

            // delete associate values and update forms if attribute is delete
            const deletedAttrs = difference(difference(currentLibraryAttributes, defaultAttributes), libAttributes);
            if (deletedAttrs.length) {
                await deleteAssociatedValues.deleteAssociatedValues(deletedAttrs, libData.id, ctx);
                await updateAssociatedForms.updateAssociatedForms(deletedAttrs, libData.id, ctx);
            }

            // sending indexation event
            await eventsManager.sendDatabaseEvent(
                {
                    action: EventAction.LIBRARY_SAVE,
                    topic: {
                        library: savedLib.id
                    },
                    after: {
                        ...savedLib,
                        fullTextAttributes: libFullTextAttributes,
                        attributes: libAttributes
                    },
                    before: existingLib
                        ? {
                              ...library,
                              fullTextAttributes: currentFullTextAttributes,
                              attributes: currentLibraryAttributes
                          }
                        : null
                },
                ctx
            );

            if (existingLib) {
                const cacheKey = utils.getCoreEntityCacheKey('library', savedLib.id);
                await cacheService.getCache(ECacheType.RAM).deleteData([cacheKey, `${cacheKey}:*`]);
            }

            return savedLib;
        },
        async deleteLibrary(id: string, ctx: IQueryInfos): Promise<ILibrary> {
            // Check permissions
            const action = AdminPermissionsActions.DELETE_LIBRARY;
            const canSaveLibrary = await adminPermissionDomain.getAdminPermission({action, userId: ctx.userId, ctx});

            if (!canSaveLibrary) {
                throw new PermissionError(action);
            }

            // Get library
            const library = await this.getLibraryProperties(id, ctx);

            if (library.system) {
                throw new ValidationError({id: Errors.SYSTEM_LIBRARY_DELETION});
            }

            await runPreDelete(library, ctx);

            // Get all records and delete them
            const records = await recordDomain.find({params: {library: id}, ctx});
            for (const r of records.list) {
                await recordDomain.deleteRecord({library: id, id: r.id, ctx});
            }

            const deletedLibrary = await libraryRepo.deleteLibrary({id, ctx});

            // sending indexation event
            await eventsManager.sendDatabaseEvent(
                {
                    action: EventAction.LIBRARY_DELETE,
                    topic: {
                        library: id
                    },
                    before: {...deletedLibrary, attributes: undefined, fullTextAttributes: undefined}
                },
                ctx
            );

            const cacheKey = utils.getCoreEntityCacheKey('library', id);
            await cacheService.getCache(ECacheType.RAM).deleteData([cacheKey, `${cacheKey}:*`]);

            return deletedLibrary;
        }
    };
}
