// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useCallback, useContext, useEffect, useRef} from 'react';
import {v4 as uuid} from 'uuid';
import {LangContext} from '_ui/contexts';
import {type Callbacks, type CallCbFunction, type IUseIFrameMessengerOptions, type MessageDispatcher} from './types';
import {encodeMessage, decodeMessage, getExposedMethods, initClientHandlers} from './messageHandlers';

export const useIFrameMessenger = (options?: IUseIFrameMessengerOptions) => {
    console.log('useIFrameMessenger', options);

    const registry = useRef<Record<string, Window>>({});
    const selfId = useRef(options?.id ?? uuid());

    const {setLang} = useContext(LangContext);
    const changeLangInAllFrames = (newLanguage: string) => {
        dispatch(
            {
                type: 'change-language',
                language: newLanguage
            },
            'all'
        );
    };

    const dispatch = useCallback<MessageDispatcher>(
        (message, frameId) => {
            if (window !== window.top) {
                window.parent.postMessage(encodeMessage({...message, __frameId: selfId.current}), '*');
            } else if (frameId && registry.current[frameId]) {
                (registry.current[frameId] as Window).postMessage(
                    encodeMessage({...message, __frameId: selfId.current}),
                    '*'
                );
            } else if (frameId === 'all') {
                Object.values(registry.current).forEach(frame => {
                    frame.postMessage(encodeMessage({...message, __frameId: selfId.current}), '*');
                });
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
            const message = decodeMessage(event.data);

            if (message === undefined) {
                return;
            }

            if (message.type === 'register') {
                const frames = window.frames;
                // Due to weak typing on Window, we cannot iterate directly on window.frames
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i = 0; i < frames.length; i++) {
                    if (event.source === frames[i]) {
                        registry.current[message.id] = frames[i];
                    }
                }
            } else {
                if (message.type === 'change-language') {
                    setLang(message.language);
                } else {
                    console.log('message', message);
                    clientHandlers(message, dispatch);
                }
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

    return {...methods.current, changeLangInAllFrames};
};
