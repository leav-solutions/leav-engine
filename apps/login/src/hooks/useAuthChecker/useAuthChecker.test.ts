import * as leavUi from '@leav/ui';
import {act, renderHook} from '@testing-library/react';
import useAuthChecker from './useAuthChecker';

describe('useAuthChecker', () => {
    test('Success case', async () => {
        vi.spyOn(leavUi, 'useLoginChecker').mockReturnValue({
            loginChecker: vi.fn(),
        });

        const {result, rerender} = renderHook(() => useAuthChecker());

        expect(result.current).toBe('loading');

        await act(async () => {
            rerender();
        });

        expect(result.current).toBe('success');
    });

    test('Fail case', async () => {
        vi.spyOn(leavUi, 'useLoginChecker').mockReturnValue({
            loginChecker: vi.fn().mockRejectedValue(new Error('')),
        });

        const {result, rerender} = renderHook(() => useAuthChecker());

        expect(result.current).toBe('loading');

        await act(async () => {
            rerender();
        });

        expect(result.current).toBe('fail');
    });
});
