import {LibraryBehavior} from '../../_gqlTypes';
import {act, renderHook} from '../../_tests/testUtils';
import {TestProviders} from '../../_tests/TestProviders';
import {mockLibraryPermissions} from '../../__mocks__/common/library';
import {type IActiveLibrary} from '../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import {initialActiveLibrary, useActiveLibrary} from './useActiveLibrary';

describe('useActiveLibrary', () => {
    const mockActiveLibrary: IActiveLibrary = {
        id: 'test',
        name: 'test',
        behavior: LibraryBehavior.standard,
        attributes: [],
        trees: [],
        permissions: mockLibraryPermissions,
    };

    test('should get empty library if no activeLibrary set', async () => {
        const {result} = renderHook(() => useActiveLibrary(), {wrapper: TestProviders});
        const [activeLibrary] = result.current;

        expect(activeLibrary).toEqual(initialActiveLibrary);
    });

    test('should get activeLibrary', async () => {
        const {result} = renderHook(() => useActiveLibrary(), {wrapper: TestProviders});
        const [, updateActiveLibrary] = result.current;

        await act(async () => {
            updateActiveLibrary(mockActiveLibrary);
        });

        expect(result.current[0]).toEqual(mockActiveLibrary);
    });
});
