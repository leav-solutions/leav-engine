import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {getUser} from '../../../queries/cache/user/userQuery';
import UserMenu from './UserMenu';

describe('UserMenu', () => {
    const userId = 'testUserId';
    const userName = 'testUserName';

    test('should show username', async () => {
        let comp: any;

        const mockCache = new InMemoryCache();

        mockCache.writeQuery({
            query: getUser,
            data: {userId, userName, userPermissions: {}}
        });

        await act(async () => {
            comp = mount(
                <MockedProvider cache={mockCache} addTypename={false}>
                    <UserMenu />
                </MockedProvider>
            );

            await wait();

            comp.update();
        });

        expect(comp.text()).toContain(userName);
    });
});
