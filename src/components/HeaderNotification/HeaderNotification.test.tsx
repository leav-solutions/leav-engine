import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {
    getNotificationsStack,
    IGetNotificationsStack
} from '../../queries/cache/notifications/getNotificationsStackQuery';
import {INotification, NotificationType} from '../../_types/types';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import HeaderNotification from './HeaderNotification';

describe('HeaderNotification', () => {
    test('should display base message', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <HeaderNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain('notification.base-message');
    });

    test('should display message given', async () => {
        const mockCache = new InMemoryCache();

        const mockNotification: INotification = {
            content: 'this is a test',
            type: NotificationType.basic
        };

        mockCache.writeQuery<IGetNotificationsStack>({
            query: getNotificationsStack,
            data: {
                notifications: {stacks: [mockNotification]}
            }
        });

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProvider cache={mockCache}>
                    <HeaderNotification />
                </MockedProvider>
            );
        });

        expect(comp.text()).toContain(mockNotification.content);
    });
});
