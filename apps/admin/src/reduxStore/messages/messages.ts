import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {type SemanticICONS} from 'semantic-ui-react/dist/commonjs/generic';

export enum MessagesTypes {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    WARNING = 'WARNING',
}

export interface IMessage {
    id?: string;
    type: MessagesTypes;
    icon?: SemanticICONS;
    title?: string;
    content?: string;
}

export interface IMessagesReducerState {
    messages: IMessage[];
}

export const initialState: IMessagesReducerState = {
    messages: [],
};

export const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<Omit<IMessage, 'id'>>) => {
            state.messages.push({
                ...action.payload,
                id: window.crypto.randomUUID(),
            });
        },
        removeMessage: (state, action: PayloadAction<string>) => {
            const messageId = action.payload;
            const index = state.messages.findIndex(msg => msg.id === messageId);

            if (index === -1) {
                return state;
            }

            state.messages = [...state.messages.slice(0, index), ...state.messages.slice(index + 1)];
        },
    },
});

// Action creators are generated for each case reducer function
export const {addMessage, removeMessage} = messagesSlice.actions;

export default messagesSlice.reducer;
