// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache} from '@apollo/client';
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {getUser} from '../../../graphQL/queries/cache/user/userQuery';
import UserMenu from './UserMenu';

const userId = 'testUserId';
const userName = 'testUserName';
jest.mock('../../../hooks/UserHook/UserHook', () => {
    return {
        useUser: () => [
            {
                id: userId,
                userName
            },
            jest.fn()
        ]
    };
});

describe('UserMenu', () => {
    test('should show username', async () => {
        let comp: any;

        const mockCache = new InMemoryCache();

        mockCache.writeQuery({
            query: getUser,
            data: {userId, userName, userPermissions: {}}
        });

        render(<UserMenu />);

        expect(screen.getByText(userName)).toBeInTheDocument();
    });
});
