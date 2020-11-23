import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getNotifications, IGetNotification} from '../../queries/cache/notifications/getNotificationsQuery';
import {IBaseNotification, INotification, NotificationType} from '../../_types/types';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import HeaderNotification from './HeaderNotification';

jest.setTimeout(4000);

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
        // A#dd custom merge notificationsStack and baseNotification to avoid warning from apollo
        const mockCache = new InMemoryCache({
            typePolicies: {
                Query: {
                    fields: {
                        notificationsStack: {
                            merge(existing, incoming) {
                                return [...incoming];
                            }
                        },
                        baseNotification: {
                            merge(existing, incoming) {
                                return incoming;
                            }
                        }
                    }
                }
            }
        });

        const mockBaseNotification: IBaseNotification = {
            content: 'base notification',
            type: NotificationType.basic
        };

        const mockNotification: INotification = {
            content: 'this is a test',
            type: NotificationType.basic
        };

        mockCache.writeQuery<IGetNotification>({
            query: getNotifications,
            data: {
                baseNotification: mockBaseNotification,
                notificationsStack: [mockNotification]
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
