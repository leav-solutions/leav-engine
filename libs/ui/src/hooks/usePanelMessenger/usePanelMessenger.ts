import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {LangContext} from '_ui/contexts';
import {
    type AddInternalEventHandler,
    type AddMessageToPanelMessageHandler,
    type MessageToPanelMessageHandler,
    type Callbacks,
    type CallCbFunction,
    type InternalEventHandler,
    type IUsePanelMessengerOptions,
    type MessageDispatcher,
} from './types';
import {encodeMessage, decodeMessage, getExposedMethods, initClientHandlers} from './messageHandlers';

/**
 * Core hook of the IFrameMessenger system. Registers a single `window.addEventListener('message')`
 * and manages a registry of connected child frames.
 *
 * **Usage:**
 * - Top-level apps (e.g. app-studio): use via `IFrameMessengerProvider` which calls this hook once as a singleton.
 * - Client apps (child iframes): use `useIFrameMessengerClient` instead.
 *
 * **`onMessageReceived` option:** when provided, all non-system messages are delegated to this callback
 * instead of being handled locally. Used by `IFrameMessengerProvider` to route messages to the correct
 * per-iframe handlers without registering multiple listeners.
 */
export const usePanelMessenger = (options?: IUsePanelMessengerOptions) => {
    const registry = useRef<Record<string, Window>>({});
    const selfId = useRef(options?.id ?? window.crypto.randomUUID());
    const [isRegistered, setIsRegistered] = useState(window === window.top);

    const {setLang} = useContext(LangContext);

    const changeLangInAllFrames = (newLanguage: string) => {
        dispatch(
            {
                type: 'change-language',
                language: newLanguage,
            },
            'all',
        );
    };

    const panelMessageHandlerRegistry = useRef<Record<string, MessageToPanelMessageHandler>>({});
    const addPanelMessageHandler: AddMessageToPanelMessageHandler = (
        type: string,
        handler: MessageToPanelMessageHandler,
    ) => {
        panelMessageHandlerRegistry.current[type] = handler;
        return () => {
            delete panelMessageHandlerRegistry.current[type];
        };
    };

    const internalEventRegistry = useRef<Record<string, Set<InternalEventHandler>>>({});
    const addInternalEventHandler: AddInternalEventHandler = (type, handler) => {
        if (!internalEventRegistry.current[type]) {
            internalEventRegistry.current[type] = new Set();
        }
        internalEventRegistry.current[type].add(handler);
        return () => {
            internalEventRegistry.current[type].delete(handler);
            if (internalEventRegistry.current[type].size === 0) {
                delete internalEventRegistry.current[type];
            }
        };
    };

    const dispatch = useCallback<MessageDispatcher>(
        (message, frameId) => {
            if (window !== window.top) {
                window.parent.postMessage(encodeMessage({...message, __frameId: selfId.current}), '*');
            } else if (frameId && registry.current[frameId]) {
                (registry.current[frameId] as Window).postMessage(
                    encodeMessage({...message, __frameId: selfId.current}),
                    '*',
                );
            } else if (frameId === 'all') {
                Object.entries(registry.current).forEach(([id, frame]) => {
                    if (id !== message.__frameId) {
                        // DO not send the message to the sender
                        frame.postMessage(encodeMessage({...message, __frameId: selfId.current}), '*');
                    }
                });
            }
        },
        [registry.current],
    );

    const callCb = useCallback<CallCbFunction>(
        (path, data, frameId) => {
            dispatch({type: 'on-call-callback', path, data}, frameId);
        },
        [dispatch],
    );

    const unregister = () => {
        if (window !== window.top) {
            dispatch({type: 'unregister', id: selfId.current});
        }
    };

    const callbacksStore = useRef<Callbacks>({});
    const methods = useRef({
        ...getExposedMethods(callbacksStore, dispatch),
        unregister,
        changeLangInAllFrames,
        addPanelMessageHandler,
        addInternalEventHandler,
    });

    const getPanelIdFromEvent = (event: MessageEvent) => {
        const iFrames = window.document.getElementsByTagName('iframe');
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < iFrames.length; i++) {
            if (event.source === iFrames[i].contentWindow) {
                return iFrames[i].name;
            }
        }
        return null;
    };

    useEffect(() => {
        const clientHandlers = initClientHandlers(callCb, {...options, id: selfId.current}, callbacksStore);
        const onMessage = (event: MessageEvent) => {
            const message = decodeMessage(event.data);
            if (message === undefined) {
                return;
            }
            switch (message.type) {
                case 'register':
                    const frames = window.frames;
                    // Due to weak typing on Window, we cannot iterate directly on window.frames
                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                    for (let i = 0; i < frames.length; i++) {
                        if (event.source === frames[i]) {
                            registry.current[message.id] = frames[i];
                        }
                    }

                    dispatch({type: 'is-registered', id: message.id}, message.id);
                    break;
                case 'unregister':
                    if (registry.current[message.id]) {
                        delete registry.current[message.id];
                    }
                    break;
                case 'is-registered':
                    setIsRegistered(true);
                    break;
                case 'message-to-panel':
                    panelMessageHandlerRegistry.current[message.data.type]?.(message.data.payload);
                    if (window === window.top) {
                        const target = message.data.target ?? 'all';
                        dispatch(message, target);
                    }
                    break;
                case 'change-language':
                    setLang(message.language);
                    break;
                default:
                    if (internalEventRegistry.current[message.type]) {
                        const eventData = (message as unknown as {data: unknown}).data;
                        internalEventRegistry.current[message.type].forEach(handler => handler(eventData));
                    } else if (options?.onMessageReceived) {
                        // Singleton mode: delegate routing to the Provider (IFrameMessengerProvider).
                        // The Provider resolves which iframe sent the message and calls the matching handlers.
                        options.onMessageReceived(
                            event.source as Window,
                            message,
                            getPanelIdFromEvent(event),
                            dispatch,
                            callCb,
                            callbacksStore,
                        );
                    } else {
                        // Legacy / client mode: handle messages directly with local clientHandlers.
                        // get-panel-config needs panelId enriched before dispatch.
                        const enrichedMessage =
                            message.type === 'get-panel-config'
                                ? {...message, data: {...message.data, panelId: getPanelIdFromEvent(event)}}
                                : message;
                        clientHandlers(enrichedMessage, dispatch);
                    }
                    break;
            }
        };

        window.addEventListener('message', onMessage);

        if (window !== window.top) {
            // Register the message handler for the parent window
            dispatch({type: 'register', id: selfId.current});
        }

        return () => {
            window.removeEventListener('message', onMessage);
        };
    }, []);

    return {
        ...methods.current,
        isRegistered,
    };
};
