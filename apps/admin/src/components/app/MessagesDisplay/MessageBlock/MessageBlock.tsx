// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useEffect} from 'react';
import {IMessage, MessagesTypes} from 'reduxStore/messages/messages';
import {Icon, Message} from 'semantic-ui-react';
import {SemanticCOLORS, SemanticICONS} from 'semantic-ui-react/dist/commonjs/generic';
import {CSSObject} from 'styled-components';

interface IMessageProps {
    message: IMessage;
    onDelete: (msg: IMessage) => void;
}

const iconByType: {[type in MessagesTypes]: {iconName: SemanticICONS; iconColor: SemanticCOLORS}} = {
    [MessagesTypes.SUCCESS]: {
        iconName: 'checkmark',
        iconColor: 'green'
    },
    [MessagesTypes.WARNING]: {
        iconName: 'warning',
        iconColor: 'orange'
    },
    [MessagesTypes.ERROR]: {
        iconName: 'delete',
        iconColor: 'red'
    }
};

const duration = 5000;

function MessageBlock({message, onDelete}: IMessageProps): JSX.Element {
    const _handleDismiss = () => {
        onDelete(message);
    };

    const {iconName, iconColor} = iconByType[message.type];

    useEffect(() => {
        const timeout = setTimeout(() => _handleDismiss(), duration);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    const messageStyle: CSSObject = {width: 'auto', maxWidth: '50vw', margin: '.5em', boxShadow: '0 0 4px #AAA'};

    return (
        <Message
            as="li"
            aria-label="message"
            onDismiss={_handleDismiss}
            icon={<Icon name={message.icon ?? iconName} color={iconColor} />}
            style={messageStyle}
            header={message.title}
            title={message.title}
            content={message.content}
            size="small"
        />
    );
}

export default MessageBlock;
