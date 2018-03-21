import {ILibraryRepo} from 'infra/libraryRepo';
import {IDbUtils} from 'infra/db/dbUtils';
import {ISystemTranslation} from '_types/systemTranslation';
import {IAttribute} from '_types/attribute';
import {ILibrary, ILibraryFilterOptions} from '_types/library';

export interface ILibraryDomain {
    getLibraries?(filters?: ILibraryFilterOptions): Promise<ILibrary[]>;
    saveLibrary?(library: ILibrary): Promise<ILibrary>;
    deleteLibrary?(id: string): Promise<ILibrary>;
}

export default function(libraryRepo: ILibraryRepo): ILibraryDomain {
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
            try {
                const libs = await libraryRepo.getLibraries({id: libData.id});

                const lib = libs.length
                    ? await libraryRepo.updateLibrary(libData)
                    : await libraryRepo.createLibrary(libData);

                // New library? Link default attributes. Otherwise, save given attributes if any
                const libAttributes = libs.length
                    ? typeof libData.attributes !== 'undefined' ? libData.attributes.map(attr => attr.id) : null
                    : ['id', 'created_at', 'created_by', 'modified_at', 'modified_by'];

                if (libAttributes !== null) {
                    await libraryRepo.saveLibraryAttributes(libData.id, libAttributes);
                }

                return lib;
            } catch (e) {
                throw new Error('Save library ' + e);
            }
        },
        async deleteLibrary(id: string): Promise<ILibrary> {
            try {
                // Get library
                const lib = await this.getLibraries({id});

                // Check if exists and can delete
                if (!lib.length) {
                    throw new Error('Unknown library');
                }

                if (lib.pop().system) {
                    throw new Error('Cannot delete system library');
                }

                return libraryRepo.deleteLibrary(id);
            } catch (e) {
                throw new Error('Delete library ' + e);
            }
        }
    };
}
