// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {IActiveLibrary} from '../../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';

export const useActiveLibrary = (): [IActiveLibrary | undefined, (newActiveLibrary: IActiveLibrary) => void] => {
    const activeLibrary: IActiveLibrary | undefined = {
        id: 'test_lib',
        name: 'Test Lib',
        behavior: LibraryBehavior.standard,
        attributes: [],
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
