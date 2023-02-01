// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {IActiveLibrary} from '../../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';

export const useActiveLibrary = (): [IActiveLibrary | undefined, (newActiveLibrary: IActiveLibrary) => void] => {
    const activeLibrary: IActiveLibrary | undefined = {
        id: 'test_lib',
        name: 'Test Lib',
        filter: '',
        behavior: LibraryBehavior.standard,
        attributes: [],
        gql: {
            searchableFields: 'TestLibSearchableFields',
            query: 'TestLib',
            type: 'testLib'
        },
        trees: [],
        permissions: {
            access_library: true,
            access_record: true,
            create_record: true,
            edit_record: true,
            delete_record: true
        }
    };

    const updateActiveLibrary = jest.fn();

    return [activeLibrary, updateActiveLibrary];
};
