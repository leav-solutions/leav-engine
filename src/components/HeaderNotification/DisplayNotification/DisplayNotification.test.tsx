import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {INotification, NotificationType} from '../../../_types/types';
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

    test('should display message content', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <DisplayNotification
                    message={mockMessage}
                    activeTimeouts={mockActiveTimeouts}
                    cancelNotification={jest.fn()}
                />
            );
        });

        expect(comp.text()).toContain(mockMessage.content);
    });
});
