// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render} from '_tests/testUtils';
import {IGetUser} from '../../graphQL/queries/cache/user/userQuery';
import {useUser} from './UserHook';

describe('UserHook', () => {
    const mockUser: IGetUser = {
        userId: 'test',
        userName: 'test',
        userPermissions: []
    };

    test('should get anything if no user set', async () => {
        let givenUser;

        const ComponentUsingHook = () => {
            const [lang] = useUser();

            givenUser = lang;
            return <></>;
        };

        await act(async () => {
            render(<ComponentUsingHook />);
        });

        expect(givenUser).toEqual(undefined);
    });

    test('should get lang', async () => {
        let givenUser;

        const ComponentUsingHook = () => {
            const [user, updateUser] = useUser();

            updateUser(mockUser);

            givenUser = user;
            return <></>;
        };

        await act(async () => {
            render(<ComponentUsingHook />);
        });

        expect(givenUser).toEqual(mockUser);
    });
});
