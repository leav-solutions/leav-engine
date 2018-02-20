import {ILibraryRepo, ILibraryFilterOptions} from 'infra/libraryRepo';
import {IDbUtils} from 'infra/db/dbUtils';
import {ISystemTranslation} from './coreDomain';

export interface ILibrary {
    id: string;
    label?: ISystemTranslation;
    system?: boolean;
}

export interface ILibraryDomain {
    getLibraries?(filters?: ILibraryFilterOptions): Promise<ILibrary[]>;
    saveLibrary?(library: ILibrary): Promise<ILibrary>;
    deleteLibrary?(id: string): Promise<ILibrary>;
}

export default function(libraryRepo: ILibraryRepo): ILibraryDomain {
    return {
        async getLibraries(filters?: ILibraryFilterOptions): Promise<ILibrary[]> {
            const libs = await libraryRepo.getLibraries(filters);

            return libs;
        },
        async saveLibrary(libData: ILibrary): Promise<ILibrary> {
            try {
                const libs = await libraryRepo.getLibraries({id: libData.id});

                const lib = libs.length
                    ? await libraryRepo.updateLibrary(libData)
                    : await libraryRepo.createLibrary(libData);

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
