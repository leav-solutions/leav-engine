// Kept in a separate file from the Provider component to satisfy the
import {createContext} from 'react';
import {
    type AddInternalEventHandler,
    type DispatchToNativePanel,
    type InternalEventMessage,
    type RegisterHandlers,
    type RegisterNativePanelHandlers,
} from './types';

export interface IPanelMessengerContext {
    registerHandlers: RegisterHandlers;
    registerNativePanelHandlers: RegisterNativePanelHandlers;
    dispatchToNativePanel: DispatchToNativePanel;
    changeLangInAllFrames: (language: string) => void;
    addInternalEventHandler: AddInternalEventHandler;
    dispatchToSelf: (message: InternalEventMessage) => void;
}

export const PanelMessengerContext = createContext<IPanelMessengerContext>(null);
