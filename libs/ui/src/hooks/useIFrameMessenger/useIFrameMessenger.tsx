// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type Callbacks,
    type CallCbFunction,
    type Message,
    type IUseIFrameMessengerOptions,
    type MessageDispatcher
} from './types';
import {useCallback, useEffect, useRef} from 'react';
import {encodeMessage, decodeMessage, getExposedMethods, initClientHandlers} from './messageHandlers';
import {v4 as uuid} from 'uuid';

export const useIFrameMessenger = (options?: IUseIFrameMessengerOptions) => {
    const registry = useRef<Record<string, Window>>({});
    const selfId = useRef<string>(options?.id ?? uuid());

    const dispatch = useCallback<MessageDispatcher>(
        (message, frameId) => {
            if (window !== window.top) {
                window.parent.postMessage(encodeMessage({...message, __frameId: selfId.current}), '*');
            } else if (frameId && registry.current[frameId]) {
                (registry.current[frameId] as Window).postMessage(
                    encodeMessage({...message, __frameId: selfId.current}),
                    '*'
                );
            }
        },
        [registry.current]
    );

    const callCb = useCallback<CallCbFunction>(
        (path, data, frameId) => {
            dispatch({type: 'on-call-callback', path, data}, frameId);
        },
        [dispatch]
    );

    const callbacksStore = useRef<Callbacks>({});
    const methods = useRef(getExposedMethods(callbacksStore, dispatch));

    useEffect(() => {
        const clientHandlers = initClientHandlers(callCb, {...options, id: selfId.current}, callbacksStore);
        const onMessage = (event: MessageEvent) => {
            const message = decodeMessage(event.data) as unknown as Message;

            if (!message) {
                return;
            }

            if (message && message.type === 'register') {
                const frames = window.frames;
                if (window.frames.length) {
                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                    for (let i = 0; i < frames.length; i++) {
                        if (event.source === frames[i]) {
                            registry.current[message.id] = frames[i];
                        }
                    }
                }
            } else {
                clientHandlers(message, dispatch);
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

    return methods.current;
};
