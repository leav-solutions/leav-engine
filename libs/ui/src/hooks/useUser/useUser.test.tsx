// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import MockedUserContextProvider from '_ui/testing/MockedUserContextProvider';
import {renderHook} from '_ui/_tests/testUtils';
import {useUser} from './useUser';

describe('useUser', () => {
    test('Return user data from context', async () => {
        const hook = renderHook(() => useUser(), {
            wrapper: ({children}) => <MockedUserContextProvider>{children as JSX.Element}</MockedUserContextProvider>
        });

        expect(hook.result.current.userData.userId).toEqual('123');
    });

    test('Throw if no context provided', async () => {
        const errorLogger = console.error;
        console.error = jest.fn();
        try {
            renderHook(() => useUser());
        } catch (e) {
            expect(e).toBeDefined();
        }

        console.error = errorLogger;
    });
});
