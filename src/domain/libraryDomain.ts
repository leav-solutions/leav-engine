import {ILibraryRepository} from 'infra/libraryRepository';
import {IDbUtils} from 'infra/db/dbUtils';

export interface ILibrary {
    id: string;
    system?: boolean;
}

export interface ILibraryDomain {
    getLibrary(id: string): Promise<ILibrary>;
    getLibraries(): Promise<ILibrary[]>;
    saveLibrary(library: ILibrary): Promise<ILibrary>;
}

export default function(libraryRepository: ILibraryRepository): ILibraryDomain {
    /**
     * Get library by ID
     *
     * @param id
     * @return Promise<{}>
     */
    const getLibrary = async function(id: string): Promise<ILibrary> {
        const libs = await libraryRepository.getLibraries({id});

        if (libs.length) {
            return libs[0];
        } else {
            return null;
        }
    };

    /**
     * Get all libraries
     *
     * @return Promise<{}>
     */
    const getLibraries = async function(): Promise<ILibrary[]> {
        const libs = await libraryRepository.getLibraries();

        if (libs.length) {
            return libs;
        } else {
            return [];
        }
    };

    /**
     * Save library.
     * If lib doesn't exist => create a new one, otherwise update existing library
     *
     * @param (} libData
     * @return Promise<{}>  Saved library
     */
    const saveLibrary = async function(libData: ILibrary): Promise<ILibrary> {
        try {
            const libs = await libraryRepository.getLibraries({id: libData.id});

            const lib = libs.length
                ? await libraryRepository.updateLibrary(libData)
                : await libraryRepository.createLibrary(libData);

            return lib;
        } catch (e) {
            throw new Error('Save library ' + e);
        }
    };

    return {
        getLibrary,
        getLibraries,
        saveLibrary
    };
}
