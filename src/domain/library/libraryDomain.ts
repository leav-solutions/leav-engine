// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAppPermissionDomain} from 'domain/permission/appPermissionDomain';
import {i18n} from 'i18next';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {omit, union, difference} from 'lodash';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {ErrorFieldDetail} from '_types/errors';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import getDefaultAttributes from '../../utils/helpers/getLibraryDefaultAttributes';
import {Errors} from '../../_types/errors';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {IList, SortOrder} from '../../_types/list';
import {AppPermissionsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IRecordDomain} from '../record/recordDomain';
import checkSavePermission from './helpers/checkSavePermission';
import runBehaviorPostDelete from './helpers/runBehaviorPostDelete';
import runBehaviorPostSave from './helpers/runBehaviorPostSave';
import validateLibAttributes from './helpers/validateLibAttributes';
import validateLibFullTextAttributes from './helpers/validateLibFullTextAttributes';
import validatePermConf from './helpers/validatePermConf';
import validateRecordIdentityConf from './helpers/validateRecordIdentityConf';
import {EventType} from '../../_types/event';
import * as Config from '_types/config';
import {IDeleteAssociatedValuesHelper} from './helpers/deleteAssociatedValues';

export interface ILibraryDomain {
    getLibraries({params, ctx}: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<ILibrary>>;
    saveLibrary(library: ILibrary, ctx: IQueryInfos): Promise<ILibrary>;
    deleteLibrary(id: string, ctx: IQueryInfos): Promise<ILibrary>;
    getLibraryProperties(id: string, ctx: IQueryInfos): Promise<ILibrary>;
    getLibrariesUsingAttribute(attributeId: string, ctx: IQueryInfos): Promise<string[]>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.library'?: ILibraryRepo;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission.app'?: IAppPermissionDomain;
    'core.utils'?: IUtils;
    translator?: i18n;
    'core.infra.tree'?: ITreeRepo;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.library.helpers.deleteAssociatedValues'?: IDeleteAssociatedValuesHelper;
}

export default function({
    config = null,
    'core.infra.library': libraryRepo = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.permission.app': appPermissionDomain = null,
    'core.infra.tree': treeRepo = null,
    'core.utils': utils = null,
    'core.domain.eventsManager': eventsManager = null,
    'core.domain.record': recordDomain = null,
    'core.domain.library.helpers.deleteAssociatedValues': deleteAssociatedValues = null,
    translator: translator
}: IDeps = {}): ILibraryDomain {
    return {
        async getLibraries({params, ctx}): Promise<IList<ILibrary>> {
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
        async getLibraryProperties(id: string, ctx): Promise<ILibrary> {
            if (!id) {
                throw new ValidationError({id: Errors.MISSING_LIBRARY_ID});
            }

            const libs = await libraryRepo.getLibraries({
                params: {filters: {id}, strictFilters: true},
                ctx
            });

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            const props = libs.list.pop();

            return props;
        },
        async getLibrariesUsingAttribute(attributeId: string, ctx: IQueryInfos): Promise<string[]> {
            const attrs = await attributeDomain.getAttributes({
                params: {filters: {id: attributeId}, strictFilters: true},
                ctx
            });

            if (!attrs.list.length) {
                throw new ValidationError<IAttribute>({id: Errors.UNKNOWN_ATTRIBUTE});
            }

            return libraryRepo.getLibrariesUsingAttribute(attributeId, ctx);
        },
        async saveLibrary(libData: ILibrary, ctx: IQueryInfos): Promise<ILibrary> {
            const libs = await libraryRepo.getLibraries({params: {filters: {id: libData.id}}, ctx});
            const existingLib = !!libs.list.length;

            const defaultParams = {
                id: '',
                system: false,
                behavior: LibraryBehavior.STANDARD,
                label: {fr: '', en: ''}
            };

            // If existing lib, skip all uneditable fields from supplied params.
            // If new lib, merge default params with supplied params
            const uneditableFields = ['behavior', 'system'];
            const dataToSave = existingLib ? omit(libData, uneditableFields) : {...defaultParams, ...libData};

            const validationErrors: Array<ErrorFieldDetail<ILibrary>> = [];
            const defaultAttributes = getDefaultAttributes(dataToSave.behavior, libData.id);
            const currentLibraryAttributes = existingLib
                ? (await attributeDomain.getLibraryAttributes(libData.id, ctx)).map(a => a.id)
                : [];
            const currentFullTextAttributes = existingLib
                ? (await attributeDomain.getLibraryFullTextAttributes(libData.id, ctx)).map(a => a.id)
                : [];

            // Check permissions
            const permCheck = await checkSavePermission(existingLib, ctx.userId, {appPermissionDomain}, ctx);
            if (!permCheck.canSave) {
                throw new PermissionError(permCheck.action);
            }

            // Validate ID format
            if (!utils.validateID(dataToSave.id)) {
                throw new ValidationError({id: Errors.INVALID_ID_FORMAT});
            }

            validationErrors.push(await validatePermConf(dataToSave.permissions_conf, {attributeDomain}, ctx));

            // New library? Link default attributes. Otherwise, save given attributes if any
            const attributesToSave = dataToSave.attributes
                ? dataToSave.attributes.map(attr => attr.id)
                : currentLibraryAttributes;

            const fullTextAttributesToSave = dataToSave.fullTextAttributes
                ? dataToSave.fullTextAttributes.map(fta => fta.id)
                : currentFullTextAttributes;

            const libAttributes = union(defaultAttributes, attributesToSave);

            const libFullTextAttributes = [...new Set(['id', ...fullTextAttributesToSave])];

            // We can get rid of attributes and full text attributes in lib data, it will be saved separately
            delete dataToSave.attributes;
            delete dataToSave.fullTextAttributes;

            validationErrors.push(
                await validateLibAttributes(libAttributes, {attributeDomain}, ctx),
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
                )
            );

            // remove full text attributes if attribute is delete
            libFullTextAttributes.filter(a => libAttributes.includes(a));

            const mergedValidationErrors = validationErrors.reduce((acc, cur) => ({...acc, ...cur}), {});
            if (Object.keys(mergedValidationErrors).length) {
                throw new ValidationError(mergedValidationErrors);
            }

            const lib = existingLib
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

            await runBehaviorPostSave(lib, !existingLib, {treeRepo, utils}, ctx);

            // delete associate values if attribute is delete
            const deletedAttrs = difference(difference(currentLibraryAttributes, defaultAttributes), libAttributes);
            if (deletedAttrs.length) {
                await deleteAssociatedValues.deleteAssociatedValues(deletedAttrs, libData.id, ctx);
            }

            // sending indexation event
            await eventsManager.send(
                {
                    type: EventType.LIBRARY_SAVE,
                    data: {
                        new: {
                            ...lib,
                            fullTextAttributes: libFullTextAttributes,
                            attributes: libAttributes
                        },
                        ...(existingLib && {
                            old: {
                                ...libs.list[0],
                                fullTextAttributes: currentFullTextAttributes,
                                attributes: currentLibraryAttributes
                            }
                        })
                    }
                },
                ctx
            );

            return lib;
        },
        async deleteLibrary(id: string, ctx: IQueryInfos): Promise<ILibrary> {
            // Check permissions
            const action = AppPermissionsActions.DELETE_LIBRARY;
            const canSaveLibrary = await appPermissionDomain.getAppPermission({action, userId: ctx.userId, ctx});

            if (!canSaveLibrary) {
                throw new PermissionError(action);
            }

            // Get library
            const libraries = await this.getLibraries({params: {filters: {id}}, ctx});

            if (!libraries.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            const lib = libraries.list[0];
            if (lib.system) {
                throw new ValidationError({id: Errors.SYSTEM_LIBRARY_DELETION});
            }

            await runBehaviorPostDelete(lib, {treeRepo, utils}, ctx);

            // TODO: delete all records
            // get all records and delete them
            const records = await recordDomain.find({params: {library: id}, ctx});
            for (const r of records.list) {
                await recordDomain.deleteRecord({library: id, id: r.id, ctx});
            }

            const deletedLibrary = await libraryRepo.deleteLibrary({id, ctx});

            // sending indexation event
            await eventsManager.send(
                {
                    type: EventType.LIBRARY_DELETE,
                    data: {old: {...deletedLibrary, attributes: undefined, fullTextAttributes: undefined}}
                },
                ctx
            );

            return deletedLibrary;
        }
    };
}
