import {ILibraryDomain} from 'domain/library/libraryDomain';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';

export const validateLibrary = async (
    library: string,
    {'core.domain.library': libraryDomain = null}: {'core.domain.library'?: ILibraryDomain}
) => {
    // Check if library exists
    const libProps = await libraryDomain.getLibraries({filters: {id: library}, strictFilters: true});
    if (!libProps.list.length) {
        throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
    }
};
