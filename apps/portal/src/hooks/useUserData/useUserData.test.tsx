// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import UserContext from 'context/UserContext';
import React from 'react';
import {mockUser} from '_tests/mocks/user';
import {renderHook} from '_tests/testUtils';
import useUserData from '.';

describe('useUserData', () => {
    test('Return user data from context', async () => {
        const {result} = renderHook(() => useUserData(), {
            wrapper: ({children}) => <UserContext.Provider value={mockUser}>{children}</UserContext.Provider>
        });

        expect(result.current.id).toBe('1');
    });

    test('Throw if no context provided', async () => {
        const errorLogger = console.error;
        console.error = jest.fn();
        expect(() => renderHook(() => useUserData())).toThrowError();

        console.error = errorLogger;
    });
});
