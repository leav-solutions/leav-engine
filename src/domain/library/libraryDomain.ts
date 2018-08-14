import {ILibraryRepo} from 'infra/library/libraryRepo';
import {difference} from 'lodash';
import ValidationError from '../../errors/ValidationError';
import {ILibrary, ILibraryFilterOptions} from '../../_types/library';
import {IAttributeDomain} from '../attribute/attributeDomain';

export interface ILibraryDomain {
    getLibraries(filters?: ILibraryFilterOptions): Promise<ILibrary[]>;
    saveLibrary(library: ILibrary): Promise<ILibrary>;
    deleteLibrary(id: string): Promise<ILibrary>;
    getLibraryProperties(id: string): Promise<ILibrary>;
}

export default function(libraryRepo: ILibraryRepo, attributeDomain: IAttributeDomain | null = null): ILibraryDomain {
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
            const libs = await libraryRepo.getLibraries({id});

            if (!libs.length) {
                throw new ValidationError({id: 'Unknown library ' + id});
            }
            const props = libs.pop();

            return props;
        },
        async saveLibrary(libData: ILibrary): Promise<ILibrary> {
            const libs = await libraryRepo.getLibraries({id: libData.id});
            const newLib = !!libs.length;
            const errors = {} as any;
            const canSave = true;

            if (libData.permissionsConf) {
                const availableTreeAttributes = await attributeDomain.getAttributes();
                const unknownTreeAttributes = difference(
                    libData.permissionsConf.permissionTreeAttributes,
                    availableTreeAttributes.map(treeAttr => treeAttr.id)
                );

                if (unknownTreeAttributes.length) {
                    errors.permissionsConf = `Unknown tree attributes: ${unknownTreeAttributes.join(', ')}`;
                }
            }

            // New library? Link default attributes. Otherwise, save given attributes if any
            const libAttributes = newLib
                ? typeof libData.attributes !== 'undefined'
                    ? libData.attributes.map(attr => attr.id)
                    : null
                : ['id', 'created_at', 'created_by', 'modified_at', 'modified_by'];

            if (libAttributes !== null) {
                const availableAttributes = await attributeDomain.getAttributes();
                const unknownAttrs = difference(libAttributes, availableAttributes.map(attr => attr.id));

                if (unknownAttrs.length) {
                    errors.attributes = `Unknown attributes: ${unknownAttrs.join(', ')}`;
                } else {
                    await libraryRepo.saveLibraryAttributes(libData.id, libAttributes);
                }
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            const lib = newLib ? await libraryRepo.updateLibrary(libData) : await libraryRepo.createLibrary(libData);

            return lib;
        },
        async deleteLibrary(id: string): Promise<ILibrary> {
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
