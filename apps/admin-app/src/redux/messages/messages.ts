// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SemanticICONS} from 'semantic-ui-react/dist/commonjs/generic';
import {v4 as uuidv4} from 'uuid';

export enum MessagesTypes {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    WARNING = 'WARNING'
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
    messages: []
};

export const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<Omit<IMessage, 'id'>>) => {
            state.messages.push({
                ...action.payload,
                id: uuidv4()
            });
        },
        removeMessage: (state, action: PayloadAction<string>) => {
            const messageId = action.payload;
            const index = state.messages.findIndex(msg => msg.id === messageId);

            if (index === -1) {
                return state;
            }

            state.messages = [...state.messages.slice(0, index), ...state.messages.slice(index + 1)];
        }
    }
});

// Action creators are generated for each case reducer function
export const {addMessage, removeMessage} = messagesSlice.actions;

export default messagesSlice.reducer;
