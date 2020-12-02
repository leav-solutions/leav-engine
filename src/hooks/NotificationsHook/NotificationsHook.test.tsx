// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {useNotifications} from './NotificationsHook';

describe('NotificationsHook', () => {
    test('should get notificationsStack', async () => {
        let givenNotificationsStack: any;

        const ComponentUsingNotification = () => {
            const {notificationsStack} = useNotifications();

            givenNotificationsStack = notificationsStack;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenNotificationsStack).toEqual([]);
    });

    test('should get baseNotification', async () => {
        let givenBaseNotification: any;

        const ComponentUsingNotification = () => {
            const {baseNotification} = useNotifications();

            givenBaseNotification = baseNotification;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenBaseNotification).toEqual({content: 'notification.base-message', type: expect.anything()});
    });
});
