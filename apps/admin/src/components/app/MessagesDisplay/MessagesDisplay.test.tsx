import '@testing-library/jest-dom';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as useMessages from '../../../hooks/useMessages';
import React from 'react';
import {MessagesTypes} from '../../../reduxStore/messages/messages';
import MessagesDisplay from './MessagesDisplay';

describe('MessagesDisplay', () => {
    test('Display list of messages', async () => {
        vi.spyOn(useMessages, 'default').mockImplementation(() => ({
            messages: [
                {
                    id: 'A',
                    type: MessagesTypes.SUCCESS,
                    content: '1',
                },
                {
                    id: 'B',
                    type: MessagesTypes.SUCCESS,
                    content: '2',
                },
                {
                    id: 'C',
                    type: MessagesTypes.SUCCESS,
                    content: '3',
                },
            ],
            addMessage: vi.fn(),
            removeMessage: vi.fn(),
        }));

        render(<MessagesDisplay />);

        expect(screen.getAllByRole('listitem', {name: 'message'})).toHaveLength(3);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('Can delete message manually', async () => {
        const mockRemoveMessage = vi.fn();
        vi.spyOn(useMessages, 'default').mockImplementation(() => ({
            messages: [
                {
                    id: 'A',
                    type: MessagesTypes.SUCCESS,
                    content: '1',
                },
            ],
            addMessage: vi.fn(),
            removeMessage: mockRemoveMessage,
        }));

        render(<MessagesDisplay />);

        const messageElem = screen.getByRole('listitem', {name: 'message'});

        // Close btn has no role defined (thanks Semantic!) so we have to find it by class
        const closeIcon = messageElem.getElementsByClassName('close')[0];

        await userEvent.click(closeIcon);

        expect(mockRemoveMessage).toHaveBeenCalled();
    });
});
