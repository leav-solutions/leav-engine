// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as useMessages from 'hooks/useMessages';
import React from 'react';
import {MessagesTypes} from 'redux/messages/messages';
import MessagesDisplay from './MessagesDisplay';

describe('MessagesDisplay', () => {
    test('Display list of messages', async () => {
        jest.spyOn(useMessages, 'default').mockImplementation(() => ({
            messages: [
                {
                    id: 'A',
                    type: MessagesTypes.SUCCESS,
                    content: '1'
                },
                {
                    id: 'B',
                    type: MessagesTypes.SUCCESS,
                    content: '2'
                },
                {
                    id: 'C',
                    type: MessagesTypes.SUCCESS,
                    content: '3'
                }
            ],
            addMessage: jest.fn(),
            removeMessage: jest.fn()
        }));

        render(<MessagesDisplay />);

        expect(screen.getAllByRole('listitem', {name: 'message'})).toHaveLength(3);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('Can delete message manually', async () => {
        const mockRemoveMessage = jest.fn();
        jest.spyOn(useMessages, 'default').mockImplementation(() => ({
            messages: [
                {
                    id: 'A',
                    type: MessagesTypes.SUCCESS,
                    content: '1'
                }
            ],
            addMessage: jest.fn(),
            removeMessage: mockRemoveMessage
        }));

        render(<MessagesDisplay />);

        const messageElem = screen.getByRole('listitem', {name: 'message'});

        // Close btn has no role defined (thanks Semantic!) so we have to find it by class
        const closeIcon = messageElem.getElementsByClassName('close')[0];

        await act(async () => {
            userEvent.click(closeIcon);
        });

        expect(mockRemoveMessage).toHaveBeenCalled();
    });
});
