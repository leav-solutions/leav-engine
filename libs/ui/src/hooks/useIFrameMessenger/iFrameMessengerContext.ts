// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

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
