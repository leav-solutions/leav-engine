// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {Errors} from '../../../_types/errors';
import ValidationError from '../../../errors/ValidationError';
import {IQueryInfos} from '_types/queryInfos';

export default async (library: string, deps: {libraryDomain: ILibraryDomain}, ctx: IQueryInfos): Promise<void> => {
    const lib = await deps.libraryDomain.getLibraries({params: {filters: {id: library}, strictFilters: true}, ctx});
    // Check if exists and can delete
    if (!lib.list.length) {
        throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
    }
};
