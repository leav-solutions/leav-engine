import {i18n} from 'i18next';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {omit, union} from 'lodash';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {ErrorFieldDetail} from '_types/errors';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IPermissionDomain} from '../permission/permissionDomain';
import checkSavePermission from './helpers/checkSavePermission';
import getDefaultAttributes from './helpers/getDefaultAttributes';
import runBehaviorPostDelete from './helpers/runBehaviorPostDelete';
import runBehaviorPostSave from './helpers/runBehaviorPostSave';
import validateLibAttributes from './helpers/validateLibAttributes';
import validatePermConf from './helpers/validatePermConf';
import validateRecordIdentityConf from './helpers/validateRecordIdentityConf';

export interface ILibraryDomain {
    getLibraries(params?: IGetCoreEntitiesParams): Promise<IList<ILibrary>>;
    saveLibrary(library: ILibrary, infos: IQueryInfos): Promise<ILibrary>;
    deleteLibrary(id: string, infos: IQueryInfos): Promise<ILibrary>;
    getLibraryProperties(id: string): Promise<ILibrary>;
    getLibraryAttributes(id: string): Promise<IAttribute[]>;
}

interface IDeps {
    'core.infra.library'?: ILibraryRepo;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.utils'?: IUtils;
    translator?: i18n;
    'core.infra.tree'?: ITreeRepo;
}

export default function({
    'core.infra.library': libraryRepo = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.infra.tree': treeRepo = null,
    'core.utils': utils = null,
    translator: translator
}: IDeps = {}): ILibraryDomain {
    return {
        async getLibraries(params?: IGetCoreEntitiesParams): Promise<IList<ILibrary>> {
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            const libsList = await libraryRepo.getLibraries(initializedParams);

            const libs = await Promise.all(
                libsList.list.map(async lib => {
                    lib.attributes = await libraryRepo.getLibraryAttributes(lib.id);

                    return lib;
                })
            );

            return {
                totalCount: libsList.totalCount,
                list: libs
            };
        },
        async getLibraryProperties(id: string): Promise<ILibrary> {
            if (!id) {
                throw new ValidationError({id: Errors.MISSING_LIBRARY_ID});
            }

            const libs = await libraryRepo.getLibraries({filters: {id}, strictFilters: true});

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            const props = libs.list.pop();

            return props;
        },
        async getLibraryAttributes(id: string): Promise<IAttribute[]> {
            const libs = await libraryRepo.getLibraries({filters: {id}});

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            return libraryRepo.getLibraryAttributes(id);
        },
        async saveLibrary(libData: ILibrary, infos: IQueryInfos): Promise<ILibrary> {
            const libs = await libraryRepo.getLibraries({filters: {id: libData.id}});
            const existingLib = !!libs.list.length;
            const errors = {} as any;
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
            const defaultAttributes = getDefaultAttributes(dataToSave.behavior);

            // Check permissions
            const permCheck = await checkSavePermission(existingLib, infos.userId, {permissionDomain});
            if (!permCheck.canSave) {
                throw new PermissionError(permCheck.action);
            }

            // Validate ID format
            if (!utils.validateID(dataToSave.id)) {
                throw new ValidationError({id: Errors.INVALID_ID_FORMAT});
            }

            validationErrors.push(await validatePermConf(dataToSave.permissions_conf, {attributeDomain}));

            // New library? Link default attributes. Otherwise, save given attributes if any
            const attributesToSave =
                typeof dataToSave.attributes !== 'undefined' ? dataToSave.attributes.map(attr => attr.id) : [];

            const libAttributes = existingLib ? attributesToSave : union(defaultAttributes, attributesToSave);

            // We can get rid of attributes in lib data, it will be saved separately
            delete dataToSave.attributes;

            validationErrors.push(
                await validateLibAttributes(libAttributes, {attributeDomain}),
                await validateRecordIdentityConf(dataToSave as ILibrary, libAttributes, {
                    attributeDomain,
                    libraryRepo
                })
            );

            const mergedValidationErrors = validationErrors.reduce((acc, cur) => ({...acc, ...cur}), {});
            if (Object.keys(mergedValidationErrors).length) {
                throw new ValidationError(mergedValidationErrors);
            }

            const lib = existingLib
                ? await libraryRepo.updateLibrary(dataToSave as ILibrary)
                : await libraryRepo.createLibrary(dataToSave as ILibrary);

            if (libAttributes.length) {
                await libraryRepo.saveLibraryAttributes(dataToSave.id, libAttributes);
            }

            await runBehaviorPostSave(lib, !existingLib, {treeRepo, utils});

            return lib;
        },
        async deleteLibrary(id: string, infos: IQueryInfos): Promise<ILibrary> {
            // Check permissions
            const action = AdminPermissionsActions.DELETE_LIBRARY;
            const canSaveLibrary = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSaveLibrary) {
                throw new PermissionError(action);
            }

            // Get library
            const libraries = await this.getLibraries({filters: {id}});

            if (!libraries.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            const lib = libraries.list[0];
            if (lib.system) {
                throw new ValidationError({id: Errors.SYSTEM_LIBRARY_DELETION});
            }

            await runBehaviorPostDelete(lib, {treeRepo, utils});

            return libraryRepo.deleteLibrary(id);
        }
    };
}
