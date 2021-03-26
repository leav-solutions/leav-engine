// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IGetUser} from '../../graphQL/queries/cache/user/userQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {useUser} from './UserHook';

describe('UserHook', () => {
    const mockUser: IGetUser = {
        userId: 'test',
        userName: 'test',
        userPermissions: []
    };

    test('should get anything if no lang set', async () => {
        let givenUser: any;

        const ComponentUsingNotification = () => {
            const [lang] = useUser();

            givenUser = lang;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenUser).toEqual(undefined);
    });

    test('should get lang', async () => {
        let givenUser: any;

        const ComponentUsingNotification = () => {
            const [lang, updateUser] = useUser();

            updateUser(mockUser);

            givenUser = lang;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenUser).toEqual(mockUser);
    });
});
