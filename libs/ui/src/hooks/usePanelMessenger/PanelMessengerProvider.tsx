import {type MutableRefObject, type ReactNode, type RefObject, useCallback, useMemo, useRef} from 'react';
import {usePanelMessenger} from './usePanelMessenger';
import {encodeMessage, initClientHandlers} from './messageHandlers';
import {
    type Callbacks,
    type CallCbFunction,
    type InternalEventMessage,
    type Message,
    type MessageDispatcher,
    type IUsePanelMessengerOptions,
    type RegisterHandlers,
    type RegisterNativePanelHandlers,
} from './types';
import {PanelMessengerContext} from './panelMessengerContext';

/**
 * Singleton Provider for the PanelMessenger system.
 * Must be mounted once above all `PanelCustom` instances.
 *
 * Owns a single `window.addEventListener('message')` (via `usePanelMessenger`)
 * and routes incoming messages to the correct panel's handlers using `handlersMap`.
 *
 * Each `PanelCustom` registers/deregisters its handlers via `usePanelIFrameHandlers`.
 */
export const PanelMessengerProvider = ({children}: {children: ReactNode}) => {
    // Maps each iframe's RefObject to its set of handlers.
    // Using RefObject as key (instead of Window) avoids timing issues: contentWindow
    // may not be available yet when the iframe mounts and registers its handlers.
    const handlersMap = useRef(new Map<RefObject<HTMLIFrameElement>, IUsePanelMessengerOptions['handlers']>());

    // Maps native React panel IDs to their handlers.
    // Same-window postMessage is used as transport: __targetPanelId in the envelope routes to the right entry.
    const nativePanelHandlersMap = useRef(new Map<string, IUsePanelMessengerOptions['handlers']>());

    // Called by usePanelMessenger for every non-system message.
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

            let matchedHandlers: IUsePanelMessengerOptions['handlers'] | undefined;
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

    const {changeLangInAllFrames, addInternalEventHandler} = usePanelMessenger({onMessageReceived});

    const dispatchToSelf = useCallback((message: InternalEventMessage) => {
        window.postMessage(encodeMessage(message as unknown as Message), '*');
    }, []);

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
        () => ({
            registerHandlers,
            registerNativePanelHandlers,
            dispatchToNativePanel,
            changeLangInAllFrames,
            addInternalEventHandler,
            dispatchToSelf,
        }),
        [],
    );

    return <PanelMessengerContext.Provider value={contextValue}>{children}</PanelMessengerContext.Provider>;
};
