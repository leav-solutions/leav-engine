// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useCallback, useContext, useEffect, useRef} from 'react';
import {LangContext} from '_ui/contexts';
import {
    type AddMessageToPanelMessageHandler,
    type MessageToPanelMessageHandler,
    type Callbacks,
    type CallCbFunction,
    type IUseIFrameMessengerOptions,
    type MessageDispatcher,
} from './types';
import {encodeMessage, decodeMessage, getExposedMethods, initClientHandlers} from './messageHandlers';

export {IUseIFrameMessengerOptions};

/**
 * This is the core of `useIFrameMessenger`. Should be used for top-level apps, such as **app-studio**.
 * For client apps (apps that need to consume the messenger), please use the `useIFrameMessengerClient`
 */
export const useIFrameMessenger = (options?: IUseIFrameMessengerOptions) => {
    const registry = useRef<Record<string, Window>>({});
    const selfId = useRef(options?.id ?? window.crypto.randomUUID());

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
    };

    const dispatch = useCallback<MessageDispatcher>(
        (message, frameId) => {
            console.log('-> dispatch on useIFrameMessenger', message, registry.current);

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
            console.log('-> callCb on useIFrameMessenger', path, data, frameId);
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
        ready: false,
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
                    break;
                case 'unregister':
                    if (registry.current[message.id]) {
                        delete registry.current[message.id];
                    }
                    break;
                case 'message-to-panel':
                    panelMessageHandlerRegistry.current[message.data.type]?.(message.data.payload);
                    if (window === window.top) {
                        const target = message.data.target ?? 'all';
                        dispatch(message, target);
                    }
                    break;
                case 'get-panel-config':
                    clientHandlers(
                        {
                            ...message,
                            data: {...message.data, panelId: getPanelIdFromEvent(event)},
                        },
                        dispatch,
                    );
                    break;
                default:
                    if (message.type === 'change-language') {
                        setLang(message.language);
                    } else {
                        clientHandlers(message, dispatch);
                    }
                    break;
            }
        };

        window.addEventListener('message', onMessage);

        if (window !== window.top) {
            console.log('registering', selfId.current, window);
            console.trace();

            // Register the message handler for the parent window
            dispatch({type: 'register', id: selfId.current});
        }

        return () => {
            window.removeEventListener('message', onMessage);
        };
    }, []);

    return methods.current;
};
