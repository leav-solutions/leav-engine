// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react';
import useRedirectToLogin from './useRedirectToLogin';

let isDevEnvMock: boolean;
jest.mock('_ui/_utils/isDevEnv', () => ({
    isDevEnv: () => isDevEnvMock
}));

describe('useRedirectToLogin', () => {
    describe('redirectToLogin', () => {
        it('Should redirect to login app isDevEnv are true', async () => {
            const {result} = renderHook(() => useRedirectToLogin());
            const reloadMock = jest.fn(() => 'reloadResult');
            const replaceMock = jest.fn(() => 'replaceResult');
            delete window.location;
            window.location = {
                reload: reloadMock,
                replace: replaceMock,
                origin: 'test://core.test',
                pathname: 'app/test'
            } as any;
            isDevEnvMock = true;

            const replaceResult = await result.current.redirectToLogin();

            expect(replaceMock).toHaveBeenCalledTimes(1);
            expect(replaceMock).toHaveBeenCalledWith('test://core.test/app/login/?dest=app/test');
            expect(reloadMock).toHaveBeenCalledTimes(0);
            expect(replaceResult).toBe('replaceResult');
        });
    });
});
