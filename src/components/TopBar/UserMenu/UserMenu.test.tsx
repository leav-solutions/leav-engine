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

    const mocks = [
        {
            request: {
                query: getUser
            },

            result: {
                data: {
                    userId: userId,
                    userName: userName,
                    userPermissions: []
                }
            }
        }
    ];

    const resolvers = {
        User: {
            userId: () => userId,
            userName: () => userName
        }
    };

    test('should be an Menu Item', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename={false} resolvers={resolvers}>
                    <UserMenu />
                </MockedProvider>
            );

            await wait();

            comp.update();
        });

        expect('div').toHaveLength(3);
    });
});
