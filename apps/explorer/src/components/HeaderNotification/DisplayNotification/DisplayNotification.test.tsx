// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {INotification, NotificationType} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import DisplayNotification from './DisplayNotification';

describe('DisplayNotification', () => {
    const mockMessage: INotification = {
        content: 'test message',
        type: NotificationType.basic
    };

    const mockActiveTimeouts: {notification: any; base: any} = {
        notification: 'timeoutNotification',
        base: null
    };

    const mockTriggerNotification: INotification[] = [];

    test('should display message content', async () => {
        const mockSetTriggerNotification = jest.fn();

        await act(async () => {
            render(
                <MockStore>
                    <MockedProviderWithFragments>
                        <DisplayNotification
                            message={mockMessage}
                            activeTimeouts={mockActiveTimeouts}
                            cancelNotification={jest.fn()}
                            triggerNotifications={mockTriggerNotification}
                            setTriggerNotifications={mockSetTriggerNotification}
                        />
                    </MockedProviderWithFragments>
                </MockStore>
            );
        });

        expect(await waitForElement(() => screen.getByText(mockMessage.content))).toBeInTheDocument();
    });

    test('should display trigger notification', async () => {
        const mockNotification: INotification[] = [
            {
                content: 'test is a text',
                type: NotificationType.basic
            }
        ];
        const mockSetTriggerNotification = jest.fn();

        await act(async () => {
            render(
                <MockStore>
                    <MockedProviderWithFragments>
                        <DisplayNotification
                            message={mockMessage}
                            activeTimeouts={mockActiveTimeouts}
                            cancelNotification={jest.fn()}
                            triggerNotifications={mockNotification}
                            setTriggerNotifications={mockSetTriggerNotification}
                        />
                    </MockedProviderWithFragments>
                </MockStore>
            );
        });

        expect(mockSetTriggerNotification).toHaveBeenCalled();
    });
});
