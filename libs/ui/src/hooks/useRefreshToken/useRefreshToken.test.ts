import {renderHook} from '@testing-library/react';
import useRefreshToken from './useRefreshToken';

const fetchMock = jest.fn();
global.fetch = fetchMock;

const localStorageMock = {
    ...global.localStorage,
    getItem: jest.fn(),
    setItem: jest.fn()
};
delete (global as any).localStorage;
(global as any).localStorage = localStorageMock;

describe('useRefreshToken', () => {
    beforeEach(() => {
        fetchMock.mockClear();
        localStorageMock.setItem.mockClear();
        localStorageMock.getItem.mockClear();
    });

    it('Should store token in localStorage', () => {
        const token = 'token';
        const {result} = renderHook(() => useRefreshToken());

        result.current.setRefreshToken(token);

        expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', token);
    });

    describe('refreshToken', () => {
        it('Should propagate error from refresh call', async () => {
            const {result} = renderHook(() => useRefreshToken());
            const failedResponse = {
                ok: false,
                statusText: 'statusText'
            };
            fetchMock.mockResolvedValueOnce(failedResponse);

            await expect(result.current.refreshToken()).rejects.toThrow(
                new Error(failedResponse.statusText, {cause: failedResponse})
            );
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/auth/refresh', {
                body: '{}',
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
        });

        it('Should set new refresh token from refresh call if present', async () => {
            const {result} = renderHook(() => useRefreshToken());
            const successResponse = {
                ok: true,
                json: jest.fn().mockResolvedValueOnce({
                    refreshToken: 'new refreshToken'
                })
            };
            fetchMock.mockResolvedValueOnce(successResponse);

            await result.current.refreshToken();

            expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
            expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'new refreshToken');
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/auth/refresh', {
                body: '{}',
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
        });

        it('Should do nothing if refreshToken is not present in refresh call', async () => {
            const {result} = renderHook(() => useRefreshToken());
            const successResponse = {
                ok: true,
                json: jest.fn().mockResolvedValueOnce({})
            };
            fetchMock.mockResolvedValueOnce(successResponse);

            await result.current.refreshToken();

            expect(localStorageMock.setItem).not.toHaveBeenCalled();
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/auth/refresh', {
                body: '{}',
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
        });
    });
});
