// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react';
import useLoginChecker from './useLoginChecker';

const fetchMock = jest.fn();
global.fetch = fetchMock;

describe('useLoginChecker', () => {
    describe('loginChecker', () => {
        it('Should propagate error from login-checker call', async () => {
            const {result} = renderHook(() => useLoginChecker());
            const failedResponse = {
                ok: false,
                statusText: 'statusText'
            };
            fetchMock.mockResolvedValueOnce(failedResponse);

            await expect(result.current.loginChecker()).rejects.toThrow(
                new Error(failedResponse.statusText, {cause: failedResponse})
            );

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/auth/login-checker', {
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
        });
    });
});
