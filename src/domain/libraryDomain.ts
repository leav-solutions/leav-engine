import {ILibraryRepo} from 'infra/libraryRepo';
import {IDbUtils} from 'infra/db/dbUtils';
import {ISystemTranslation} from '_types/systemTranslation';
import {IAttribute} from '_types/attribute';
import {ILibrary, ILibraryFilterOptions} from '_types/library';
import ValidationError from '../errors/ValidationError';
import {IAttributeDomain} from './attributeDomain';
import {difference} from 'lodash';

export interface ILibraryDomain {
    getLibraries(filters?: ILibraryFilterOptions): Promise<ILibrary[]>;
    saveLibrary(library: ILibrary): Promise<ILibrary>;
    deleteLibrary(id: string): Promise<ILibrary>;
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
        async saveLibrary(libData: ILibrary): Promise<ILibrary> {
            const libs = await libraryRepo.getLibraries({id: libData.id});
            const newLib = !!libs.length;

            const lib = newLib ? await libraryRepo.updateLibrary(libData) : await libraryRepo.createLibrary(libData);

            // New library? Link default attributes. Otherwise, save given attributes if any
            const libAttributes = newLib
                ? typeof libData.attributes !== 'undefined' ? libData.attributes.map(attr => attr.id) : null
                : ['id', 'created_at', 'created_by', 'modified_at', 'modified_by'];

            if (libAttributes !== null) {
                const availableAttributes = await attributeDomain.getAttributes();
                const unknownAttrs = difference(libAttributes, availableAttributes.map(attr => attr.id));

                if (unknownAttrs.length) {
                    throw new ValidationError({attributes: `Unknown attributes: ${unknownAttrs.join(', ')}`});
                }

                await libraryRepo.saveLibraryAttributes(libData.id, libAttributes);
            }

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
