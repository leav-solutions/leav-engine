// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {notificationsInitialState} from 'redux/notifications';
import {render, screen, waitFor} from '_tests/testUtils';
import {
    IBaseNotification,
    INotification,
    NotificationChannel,
    NotificationPriority,
    NotificationType
} from '_types/types';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import HeaderNotification from './HeaderNotification';

describe('HeaderNotification', () => {
    test('should display base message', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <HeaderNotification />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByTestId('notification-message-wrapper')).toBeInTheDocument();
    });

    test('should display passive message given', async () => {
        // Add custom merge notificationsStack and baseNotification to avoid warning from apollo

        const mockBaseNotification: IBaseNotification = {
            content: 'base notification',
            type: NotificationType.basic
        };

        const mockState = {
            notification: {...notificationsInitialState, base: mockBaseNotification}
        };

        await act(async () => {
            render(
                <MockedProvider>
                    <MockStore state={mockState}>
                        <HeaderNotification />
                    </MockStore>
                </MockedProvider>
            );
        });

        expect(await waitFor(() => screen.getByText(mockBaseNotification.content))).toBeInTheDocument();
    });

    test('should display trigger message given', async () => {
        // Add custom merge notificationsStack and baseNotification to avoid warning from apollo

        const mockNotification: INotification = {
            content: 'this is a test',
            type: NotificationType.basic,
            time: 1234567890,
            priority: NotificationPriority.low,
            channel: NotificationChannel.passive
        };

        const mockState = {
            notification: {...notificationsInitialState, stack: [mockNotification]}
        };

        await act(async () => {
            render(
                <MockedProvider>
                    <MockStore state={mockState}>
                        <HeaderNotification />
                    </MockStore>
                </MockedProvider>
            );
        });

        expect(await waitFor(() => screen.getByText(mockNotification.content))).toBeInTheDocument();
    });
});
