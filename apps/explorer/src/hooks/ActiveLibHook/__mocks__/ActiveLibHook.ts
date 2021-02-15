// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActiveLibrary} from '../../../queries/cache/activeLibrary/getActiveLibraryQuery';

export const useActiveLibrary = (): [IActiveLibrary | undefined, (newActiveLibrary: IActiveLibrary) => void] => {
    const activeLibrary: IActiveLibrary | undefined = {
        id: 'test_lib',
        name: 'Test Lib',
        filter: '',
        gql: {
            searchableFields: 'TestLibSearchableFields',
            query: 'TestLib',
            type: 'testLib'
        }
    };

    const updateActiveLibrary = jest.fn();

    return [activeLibrary, updateActiveLibrary];
};
