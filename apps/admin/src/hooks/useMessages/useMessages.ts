import {useDispatch, useSelector} from 'react-redux';
import {addMessage, type IMessage, removeMessage} from '../../reduxStore/messages/messages';
import {type RootState} from '../../reduxStore/store';

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
        removeMessage: message => dispatch(removeMessage(message.id)),
    };
};
