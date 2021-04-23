// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActiveLibrary} from 'graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';

export const mockActiveLibrary: IActiveLibrary = {
    id: 'activeLibraryId',
    name: 'activeLibraryName',
    filter: 'activeLibraryFilter',
    gql: {
        searchableFields: 'activeLibrarySearchableFields',
        query: 'activeLibraryQuery',
        type: 'activeLibraryType'
    }
};
