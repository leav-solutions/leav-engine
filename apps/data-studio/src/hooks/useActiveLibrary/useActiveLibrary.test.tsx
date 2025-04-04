// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act} from 'react-dom/test-utils';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {render} from '_tests/testUtils';
import {mockLibraryPermissions} from '__mocks__/common/library';
import {IActiveLibrary} from '../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import {initialActiveLibrary, useActiveLibrary} from './useActiveLibrary';

describe('useActiveLibrary', () => {
    const mockActiveLibrary: IActiveLibrary = {
        id: 'test',
        name: 'test',
        behavior: LibraryBehavior.standard,
        attributes: [],
        trees: [],
        permissions: mockLibraryPermissions
    };

    test('should get empty library if no activeLibrary set', async () => {
        let givenActiveLibrary: any;

        const ComponentUsingInfo = () => {
            const [activeLibrary] = useActiveLibrary();

            givenActiveLibrary = activeLibrary;
            return <></>;
        };

        await act(async () => {
            render(<ComponentUsingInfo />);
        });

        expect(givenActiveLibrary).toEqual(initialActiveLibrary);
    });

    test('should get activeLibrary', async () => {
        let givenActiveLibrary;

        const ComponentUsingInfo = () => {
            const [activeLibrary, updateActiveLibrary] = useActiveLibrary();

            updateActiveLibrary(mockActiveLibrary);

            givenActiveLibrary = activeLibrary;
            return <></>;
        };

        await act(async () => {
            render(<ComponentUsingInfo />);
        });

        expect(givenActiveLibrary).toEqual(mockActiveLibrary);
    });
});
