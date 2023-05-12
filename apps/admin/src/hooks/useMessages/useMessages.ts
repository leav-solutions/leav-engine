// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useDispatch, useSelector} from 'react-redux';
import {addMessage, IMessage, removeMessage} from 'reduxStore/messages/messages';
import {RootState} from 'reduxStore/store';

export interface IUseMessagesHook {
    messages?: IMessage[];
    addMessage: (message: Omit<IMessage, 'id'>) => void;
    removeMessage: (message: IMessage) => void;
}

export const useMessages: () => IUseMessagesHook = () => {
    const messagesFromStore = useSelector((state: RootState) => state.messages.messages);
    const dispatch = useDispatch();

    return {
        messages: messagesFromStore,
        addMessage: message => dispatch(addMessage(message)),
        removeMessage: message => dispatch(removeMessage(message.id))
    };
};
