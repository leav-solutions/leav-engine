// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type MutableRefObject, type ReactNode, type RefObject, useCallback, useMemo, useRef} from 'react';
import {useIFrameMessenger} from './useIFrameMessenger';
import {encodeMessage, initClientHandlers} from './messageHandlers';
import {
    type Callbacks,
    type CallCbFunction,
    type Message,
    type MessageDispatcher,
    type IUseIFrameMessengerOptions,
    type RegisterHandlers,
    type RegisterNativePanelHandlers,
} from './types';
import {IFrameMessengerContext} from './iFrameMessengerContext';

/**
 * Singleton Provider for the IFrameMessenger system.
 * Must be mounted once above all `PanelCustom` instances.
 *
 * Owns a single `window.addEventListener('message')` (via `useIFrameMessenger`)
 * and routes incoming messages to the correct iframe's handlers using `handlersMap`.
 *
 * Each `PanelCustom` registers/deregisters its handlers via `useIFrameMessengerHandlers`.
 */
export const IFrameMessengerProvider = ({children}: {children: ReactNode}) => {
    // Maps each iframe's RefObject to its set of handlers.
    // Using RefObject as key (instead of Window) avoids timing issues: contentWindow
    // may not be available yet when the iframe mounts and registers its handlers.
    const handlersMap = useRef(new Map<RefObject<HTMLIFrameElement>, IUseIFrameMessengerOptions['handlers']>());

    // Maps native React panel IDs to their handlers.
    // Same-window postMessage is used as transport: __targetPanelId in the envelope routes to the right entry.
    const nativePanelHandlersMap = useRef(new Map<string, IUseIFrameMessengerOptions['handlers']>());

    // Called by useIFrameMessenger for every non-system message.
    // Finds the handlers registered for the sender and dispatches the message to them.
    const onMessageReceived = useCallback(
        (
            senderWindow: Window | null,
            message: Message,
            panelId: string | null,
            dispatch: MessageDispatcher,
            callCb: CallCbFunction,
            callbacksStore: MutableRefObject<Callbacks>,
        ) => {
            // event.source is null when the sender iframe was unmounted before the message
            // was processed — the browser clears the reference on iframe removal.
            if (!senderWindow) {
                return;
            }

            // Same-window message: dispatched via dispatchToNativePanel.
            // Route to the native panel identified by __targetPanelId.
            if (senderWindow === window) {
                const targetPanelId = message.__targetPanelId;
                if (!targetPanelId) {
                    return;
                }
                const handlers = nativePanelHandlersMap.current.get(targetPanelId);
                if (!handlers) {
                    return;
                }
                const clientHandlers = initClientHandlers(callCb, {handlers}, callbacksStore);
                clientHandlers(message, dispatch);
                return;
            }

            let matchedHandlers: IUseIFrameMessengerOptions['handlers'] | undefined;
            for (const [ref, handlers] of handlersMap.current) {
                if (ref.current?.contentWindow === senderWindow) {
                    matchedHandlers = handlers;
                    break;
                }
            }

            // No registered handlers for this sender: either the iframe called unregisterHandlers
            // before its last message was processed (race condition on unmount), or the message
            // originates from an unrelated frame that passed decodeMessage validation.
            if (!matchedHandlers) {
                return;
            }

            const enrichedMessage =
                message.type === 'get-panel-config' ? {...message, data: {...message.data, panelId}} : message;

            const clientHandlers = initClientHandlers(callCb, {handlers: matchedHandlers}, callbacksStore);
            clientHandlers(enrichedMessage, dispatch);
        },
        [],
    );

    const {changeLangInAllFrames} = useIFrameMessenger({onMessageReceived});

    const registerHandlers: RegisterHandlers = useCallback((iframeRef, handlers) => {
        handlersMap.current.set(iframeRef, handlers);
        return () => handlersMap.current.delete(iframeRef);
    }, []);

    const registerNativePanelHandlers: RegisterNativePanelHandlers = useCallback((panelId, handlers) => {
        nativePanelHandlersMap.current.set(panelId, handlers);
        return () => nativePanelHandlersMap.current.delete(panelId);
    }, []);

    const dispatchToNativePanel = useCallback((panelId: string, message: Message) => {
        window.postMessage(encodeMessage({...message, __targetPanelId: panelId}), '*');
    }, []);

    const contextValue = useMemo(
        () => ({registerHandlers, registerNativePanelHandlers, dispatchToNativePanel, changeLangInAllFrames}),
        [],
    );

    return <IFrameMessengerContext.Provider value={contextValue}>{children}</IFrameMessengerContext.Provider>;
};
