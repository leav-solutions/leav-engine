import {act, renderHook} from '../../_tests/testUtils';
import {TestProviders} from '../../_tests/TestProviders';
import {mockActiveTree} from '../../__mocks__/common/activeTree';
import {useActiveTree} from './useActiveTree';

describe('useActiveTree', () => {
    test('should get undefined if no activeTree set', async () => {
        const {result} = renderHook(() => useActiveTree(), {wrapper: TestProviders});
        const [activeTree] = result.current;

        expect(activeTree).toEqual(undefined);
    });

    test('should get activeTree', async () => {
        const {result} = renderHook(() => useActiveTree(), {wrapper: TestProviders});
        const [, updateActiveTree] = result.current;

        await act(async () => {
            updateActiveTree(mockActiveTree);
        });

        expect(result.current[0]).toEqual(mockActiveTree);
    });
});
