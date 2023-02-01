// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActiveLibrary} from 'graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {mockLibraryPermissions} from './library';

export const mockActiveLibrary: IActiveLibrary = {
    id: 'activeLibraryId',
    name: 'activeLibraryName',
    filter: 'activeLibraryFilter',
    behavior: LibraryBehavior.standard,
    attributes: [],
    gql: {
        searchableFields: 'activeLibrarySearchableFields',
        query: 'activeLibraryQuery',
        type: 'activeLibraryType'
    },
    trees: [],
    permissions: mockLibraryPermissions
};
