// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
                pathname: 'app/test',
                search: '?recordId=7769990&query=1',
                toString: () => 'test://core.test/app/test?recordId=7769990&query=1'
            } as any;
            isDevEnvMock = true;

            const replaceResult = await result.current.redirectToLogin();

            expect(replaceMock).toHaveBeenCalledTimes(1);
            expect(replaceMock).toHaveBeenCalledWith(
                'test://core.test/app/login/?dest=test%3A%2F%2Fcore.test%2Fapp%2Ftest%3FrecordId%3D7769990%26query%3D1'
            );
            expect(reloadMock).toHaveBeenCalledTimes(0);
            expect(replaceResult).toBe('replaceResult');
        });
    });
});
