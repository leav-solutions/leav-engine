// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import reducer, {addMessage, initialState, MessagesTypes, removeMessage} from './messages';

describe('messages store', () => {
    test('Add message', async () => {
        const newState = reducer(
            initialState,
            addMessage({
                type: MessagesTypes.SUCCESS,
                content: 'foobar'
            })
        );

        expect(newState.messages).toHaveLength(1);
    });

    test('Remove message', async () => {
        const newState = reducer(
            {
                messages: [
                    {
                        id: '123456',
                        type: MessagesTypes.SUCCESS,
                        content: 'foobar'
                    }
                ]
            },
            removeMessage('123456')
        );

        expect(newState.messages).toHaveLength(0);
    });
});
