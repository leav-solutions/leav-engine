// Kept in a separate file from the Provider component to satisfy the
// react-refresh/only-export-components ESLint rule (Context is not a component).
import {createContext} from 'react';
import {type DispatchToNativePanel, type RegisterHandlers, type RegisterNativePanelHandlers} from './types';

export interface IIFrameMessengerContext {
    registerHandlers: RegisterHandlers;
    registerNativePanelHandlers: RegisterNativePanelHandlers;
    dispatchToNativePanel: DispatchToNativePanel;
    changeLangInAllFrames: (language: string) => void;
}

export const IFrameMessengerContext = createContext<IIFrameMessengerContext>(null);
