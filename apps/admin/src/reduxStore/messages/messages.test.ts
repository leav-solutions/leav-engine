import reducer, {addMessage, initialState, MessagesTypes, removeMessage} from './messages';

describe('messages store', () => {
    test('Add message', async () => {
        const newState = reducer(
            initialState,
            addMessage({
                type: MessagesTypes.SUCCESS,
                content: 'foobar',
            }),
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
                        content: 'foobar',
                    },
                ],
            },
            removeMessage('123456'),
        );

        expect(newState.messages).toHaveLength(0);
    });
});
