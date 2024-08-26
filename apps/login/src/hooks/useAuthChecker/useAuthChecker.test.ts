// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as leavUi from '@leav/ui';
import {act, renderHook} from '@testing-library/react';
import useAuthChecker from './useAuthChecker';

describe('useAuthChecker', () => {
    test('Success case', async () => {
        jest.spyOn(leavUi, 'useRefreshToken').mockReturnValue({
            refreshToken: jest.fn()
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
            refreshToken: jest.fn().mockRejectedValue(new Error(''))
        });

        const {result, rerender} = renderHook(() => useAuthChecker());

        expect(result.current).toBe('loading');

        await act(async () => {
            rerender();
        });

        expect(result.current).toBe('fail');
    });
});
