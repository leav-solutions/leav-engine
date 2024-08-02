// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react';
import useRefreshToken from './useRefreshToken';

const fetchMock = jest.fn();
global.fetch = fetchMock;

let isDevelopmentHelperMock: boolean;
jest.mock('_ui/_utils/isDevelopmentHelper', () => ({
    isDevelopmentHelper: () => isDevelopmentHelperMock
}));

describe('useRefreshToken', () => {
    beforeEach(() => {
        fetchMock.mockClear();
    });

    describe('refreshToken', () => {
        it('Should propagate error from refresh call if autoReload is set to false', async () => {
            const {result} = renderHook(() => useRefreshToken());
            const failedResponse = {
                ok: false,
                statusText: 'statusText'
            };
            fetchMock.mockResolvedValueOnce(failedResponse);

            await expect(result.current.refreshToken(false)).rejects.toThrow(
                new Error(failedResponse.statusText, {cause: failedResponse})
            );

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/auth/refresh', {
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
        });

        it('Should reload window from error refresh call if autoReload is set to true or not provided', async () => {
            const {result} = renderHook(() => useRefreshToken());
            const failedResponse = {
                ok: false,
                statusText: 'statusText'
            };
            fetchMock.mockResolvedValueOnce(failedResponse);
            const reloadMock = jest.fn(() => 'reloadResult');
            delete window.location;
            window.location = {
                reload: reloadMock
            } as any;
            isDevelopmentHelperMock = false;

            const reloadResult = await result.current.refreshToken();

            expect(reloadMock).toHaveBeenCalledTimes(1);
            expect(reloadMock).toHaveBeenCalledWith();
            expect(reloadResult).toBe('reloadResult');
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/auth/refresh', {
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
        });

        it('Should redirect to login app if autoReload and isDevelopmentHelper are true', async () => {
            const {result} = renderHook(() => useRefreshToken());
            const failedResponse = {
                ok: false,
                statusText: 'statusText'
            };
            fetchMock.mockResolvedValueOnce(failedResponse);
            const reloadMock = jest.fn(() => 'reloadResult');
            const replaceMock = jest.fn(() => 'replaceResult');
            delete window.location;
            window.location = {
                reload: reloadMock,
                replace: replaceMock,
                origin: 'test://core.test',
                pathname: 'app/test'
            } as any;
            isDevelopmentHelperMock = true;

            const replaceResult = await result.current.refreshToken();

            expect(replaceMock).toHaveBeenCalledTimes(1);
            expect(replaceMock).toHaveBeenCalledWith('test://core.test/app/login/?dest=app/test');
            expect(reloadMock).toHaveBeenCalledTimes(0);
            expect(replaceResult).toBe('replaceResult');
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/auth/refresh', {
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

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/auth/refresh', {
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

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/auth/refresh', {
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
        });
    });
});
