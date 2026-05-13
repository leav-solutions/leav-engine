import useMessages from '../../../hooks/useMessages';
import React from 'react';
import {type IMessage} from '../../../reduxStore/messages/messages';
import styled from 'styled-components';
import MessageBlock from './MessageBlock';

const MessagesList = styled.ul`
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2000;
`;

function MessagesDisplay(): JSX.Element {
    const {messages, removeMessage} = useMessages();

    const _handleDelete = (message: IMessage) => {
        removeMessage(message);
    };

    return (
        <>
            <MessagesList>
                {(messages ?? []).map(message => (
                    <MessageBlock key={message.id} message={message} onDelete={_handleDelete} />
                ))}
            </MessagesList>
        </>
    );
}

export default MessagesDisplay;
