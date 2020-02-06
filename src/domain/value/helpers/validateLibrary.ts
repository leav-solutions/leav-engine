import {ILibraryDomain} from 'domain/library/libraryDomain';
import {Errors} from '../../../_types/errors';
import ValidationError from '../../../errors/ValidationError';

export default async (library: string, deps: {libraryDomain: ILibraryDomain}): Promise<void> => {
    const lib = await deps.libraryDomain.getLibraries({filters: {id: library}});
    // Check if exists and can delete
    if (!lib.list.length) {
        throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
    }
};
