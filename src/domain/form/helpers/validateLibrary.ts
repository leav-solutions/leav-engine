import {ILibraryDomain} from 'domain/library/libraryDomain';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';
import {IQueryInfos} from '_types/queryInfos';

export const validateLibrary = async (
    library: string,
    {'core.domain.library': libraryDomain = null}: {'core.domain.library'?: ILibraryDomain},
    ctx: IQueryInfos
) => {
    // Check if library exists
    const libProps = await libraryDomain.getLibraries({
        params: {filters: {id: library}, strictFilters: true},
        ctx
    });
    if (!libProps.list.length) {
        throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
    }
};
