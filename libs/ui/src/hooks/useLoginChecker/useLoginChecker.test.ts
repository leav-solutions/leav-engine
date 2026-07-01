import {renderHook} from '@testing-library/react';
import useLoginChecker from './useLoginChecker';

const fetchMock = vi.fn();
global.fetch = fetchMock;

vi.mock('_ui/constants', () => ({
    GLOBAL_BASE_URL: '/global-base',
}));

describe('useLoginChecker', () => {
    describe('loginChecker', () => {
        it('Should propagate error from login-checker call', async () => {
            const {result} = renderHook(() => useLoginChecker());
            const failedResponse = {
                ok: false,
                statusText: 'statusText',
            };
            fetchMock.mockResolvedValueOnce(failedResponse);

            await expect(result.current.loginChecker()).rejects.toThrow(
                new Error(failedResponse.statusText, {cause: failedResponse}),
            );

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/global-base/auth/login-checker', {
                headers: {'Content-Type': 'application/json'},
                method: 'POST',
            });
        });
    });
});
