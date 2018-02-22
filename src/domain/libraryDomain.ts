import {ILibraryRepo, ILibraryFilterOptions} from 'infra/libraryRepo';
import {IDbUtils} from 'infra/db/dbUtils';
import {ISystemTranslation} from './coreDomain';
import {IAttribute} from './attributeDomain';

export interface ILibrary {
    id: string;
    label?: ISystemTranslation;
    system?: boolean;

    /**
     * List of attributes usable in this library
     */
    attributes?: string[] | IAttribute[];
}

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

                // New library? Link default attributes. Otherwise, save given attributes
                const libAttributes = libs.length
                    ? libData.attributes
                    : ['id', 'created_at', 'created_by', 'modified_at', 'modified_by'];

                if (typeof libAttributes !== 'undefined') {
                    await libraryRepo.saveLibraryAttributes(libData.id, libAttributes);
                }

                return lib;
            } catch (e) {
                throw new Error('Save library ' + e);
            }
        },
        async deleteLibrary(id: string): Promise<ILibrary> {
            try {
                // Get attribute
                const attr = await this.getLibraries({id});

                // Check if exists and can delete
                if (!attr.length) {
                    throw new Error('Unknown attribute');
                }

                if (attr.pop().system) {
                    throw new Error('Cannot delete system attribute');
                }

                return libraryRepo.deleteLibrary(id);
            } catch (e) {
                throw new Error('Delete attribute ' + e);
            }
        }
    };
}
