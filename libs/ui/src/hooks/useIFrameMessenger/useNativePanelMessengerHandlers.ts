// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useCallback, useContext, useEffect} from 'react';
import {IFrameMessengerContext} from './iFrameMessengerContext';
import {type IUseIFrameMessengerOptions, type Message} from './types';

/**
 * Per-panel hook for native React panels (non-iframe).
 * Registers the panel's handlers into the singleton `IFrameMessengerProvider`
 * and cleans them up on unmount.
 *
 * Uses same-window `window.postMessage` as transport, routed via `__targetPanelId`
 * in the message envelope — same protocol as iframe panels, no postMessage cross-origin.
 *
 * Returns `dispatch` to send messages to another panel by its ID.
 */
export const useNativePanelMessengerHandlers = (panelId: string, handlers: IUseIFrameMessengerOptions['handlers']) => {
    const {registerNativePanelHandlers, dispatchToNativePanel} = useContext(IFrameMessengerContext);

    useEffect(() => registerNativePanelHandlers(panelId, handlers), []);

    const dispatch = useCallback(
        (targetPanelId: string, message: Message) => dispatchToNativePanel(targetPanelId, message),
        [dispatchToNativePanel],
    );

    return {dispatch};
};
