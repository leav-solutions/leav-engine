import {ILibraryRepo} from 'infra/library/libraryRepo';
import {difference} from 'lodash';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ILibrary, ILibraryFilterOptions} from '../../_types/library';
import {AdminPermisisonsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IPermissionDomain} from '../permission/permissionDomain';

export interface ILibraryDomain {
    getLibraries(filters?: ILibraryFilterOptions): Promise<ILibrary[]>;
    saveLibrary(library: ILibrary, infos: IQueryInfos): Promise<ILibrary>;
    deleteLibrary(id: string, infos: IQueryInfos): Promise<ILibrary>;
    getLibraryProperties(id: string): Promise<ILibrary>;
    getLibraryAttributes(id: string): Promise<IAttribute[]>;
}

export default function(
    libraryRepo: ILibraryRepo,
    attributeDomain: IAttributeDomain = null,
    permissionDomain: IPermissionDomain = null,
    utils: IUtils = null
): ILibraryDomain {
    return {
        async getLibraries(filters?: ILibraryFilterOptions): Promise<ILibrary[]> {
            let libs = await libraryRepo.getLibraries(filters);

            libs = await Promise.all(
                libs.map(async lib => {
                    lib.attributes = await libraryRepo.getLibraryAttributes(lib.id);

                    return lib;
                })
            );

            return libs;
        },
        async getLibraryProperties(id: string): Promise<ILibrary> {
            if (!id) {
                throw new ValidationError({id: 'Missing library ID'});
            }

            const libs = await libraryRepo.getLibraries({id});

            if (!libs.length) {
                throw new ValidationError({id: 'Unknown library ' + id});
            }

            const props = libs.pop();

            return props;
        },
        async getLibraryAttributes(id: string): Promise<IAttribute[]> {
            const libs = await libraryRepo.getLibraries({id});

            if (!libs.length) {
                throw new ValidationError({id: 'Unknown library ' + id});
            }

            return libraryRepo.getLibraryAttributes(id);
        },
        async saveLibrary(libData: ILibrary, infos: IQueryInfos): Promise<ILibrary> {
            const dataToSave = {...libData};
            const libs = await libraryRepo.getLibraries({id: dataToSave.id});
            const newLib = !!libs.length;
            const errors = {} as any;

            // Check permissions
            const action = newLib ? AdminPermisisonsActions.EDIT_LIBRARY : AdminPermisisonsActions.CREATE_LIBRARY;
            const canSaveLibrary = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSaveLibrary) {
                throw new PermissionError(action);
            }

            if (!utils.validateID(dataToSave.id)) {
                throw new ValidationError({id: 'Invalid ID format: ' + dataToSave.id});
            }

            if (dataToSave.permissionsConf) {
                const availableTreeAttributes = await attributeDomain.getAttributes();
                const unknownTreeAttributes = difference(
                    dataToSave.permissionsConf.permissionTreeAttributes,
                    availableTreeAttributes.map(treeAttr => treeAttr.id)
                );

                if (unknownTreeAttributes.length) {
                    errors.permissionsConf = `Unknown tree attributes: ${unknownTreeAttributes.join(', ')}`;
                }
            }

            // New library? Link default attributes. Otherwise, save given attributes if any
            const libAttributes = newLib
                ? typeof dataToSave.attributes !== 'undefined'
                    ? dataToSave.attributes.map(attr => attr.id)
                    : null
                : ['id', 'created_at', 'created_by', 'modified_at', 'modified_by'];

            if (libAttributes !== null) {
                const availableAttributes = await attributeDomain.getAttributes();
                const unknownAttrs = difference(libAttributes, availableAttributes.map(attr => attr.id));

                if (unknownAttrs.length) {
                    errors.attributes = `Unknown attributes: ${unknownAttrs.join(', ')}`;
                } else {
                    await libraryRepo.saveLibraryAttributes(dataToSave.id, libAttributes);
                }
            }

            if (dataToSave.recordIdentityConf) {
                const allowedAttributes =
                    libAttributes || (await libraryRepo.getLibraryAttributes(dataToSave.id)).map(a => a.id);

                const unbindedAttrs = [];
                for (const identitiyField of Object.keys(dataToSave.recordIdentityConf)) {
                    const attrId = dataToSave.recordIdentityConf[identitiyField];
                    if (!attrId) {
                        dataToSave.recordIdentityConf[identitiyField] = null;
                        continue;
                    }

                    if (allowedAttributes.indexOf(attrId) === -1) {
                        unbindedAttrs.push(attrId);
                    }
                }

                if (unbindedAttrs.length) {
                    errors.recordIdentityConf = `Attributes must be binded to library: ${unbindedAttrs.join(', ')}`;
                }
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            const lib = newLib
                ? await libraryRepo.updateLibrary(dataToSave)
                : await libraryRepo.createLibrary(dataToSave);

            return lib;
        },
        async deleteLibrary(id: string, infos: IQueryInfos): Promise<ILibrary> {
            // Check permissions
            const action = AdminPermisisonsActions.DELETE_LIBRARY;
            const canSaveLibrary = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSaveLibrary) {
                throw new PermissionError(action);
            }

            // Get library
            const lib = await this.getLibraries({id});

            // Check if exists and can delete
            if (!lib.length) {
                throw new ValidationError({id: 'Unknown library'});
            }

            if (lib.pop().system) {
                throw new ValidationError({id: 'Cannot delete system library'});
            }

            return libraryRepo.deleteLibrary(id);
        }
    };
}
