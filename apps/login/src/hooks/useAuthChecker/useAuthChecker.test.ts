import * as leavUi from '@leav/ui';
import {act, renderHook} from '@testing-library/react';
import useAuthChecker from './useAuthChecker';

describe('useAuthChecker', () => {
    test('Success case', async () => {
        jest.spyOn(leavUi, 'useRefreshToken').mockReturnValue({
            refreshToken: jest.fn(),
            setRefreshToken: jest.fn()
        });

        const {result, rerender} = renderHook(() => useAuthChecker());

        expect(result.current).toBe('loading');

        await act(async () => {
            rerender();
        });

        expect(result.current).toBe('success');
    });

    test('Fail case', async () => {
        jest.spyOn(leavUi, 'useRefreshToken').mockReturnValue({
            refreshToken: jest.fn().mockRejectedValue(new Error('')),
            setRefreshToken: jest.fn()
        });

        const {result, rerender} = renderHook(() => useAuthChecker());

        expect(result.current).toBe('loading');

        await act(async () => {
            rerender();
        });

        expect(result.current).toBe('fail');
    });
});
