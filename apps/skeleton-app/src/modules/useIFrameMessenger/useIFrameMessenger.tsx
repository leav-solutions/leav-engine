// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useIframe} from 'use-iframe';
import {type Callbacks, type CallCbFunction, type Message, type IUseIFrameMessengerOptions} from './types';
import {useEffect, useRef} from 'react';
import {getExposedMethods, initMessageHandlers} from './messageHandlers';

export const useIFrameMessenger = (options?: IUseIFrameMessengerOptions) => {
    const callbacksStore = useRef<Callbacks>({});
    const callCb = useRef<CallCbFunction>(() => null);
    const methods = useRef(getExposedMethods(callbacksStore));
    const [dispatch] = useIframe<Message>(initMessageHandlers(callCb, options, callbacksStore), {
        ref: options?.ref
    });

    useEffect(() => {
        callCb.current = (path: string, data: unknown) => {
            dispatch({type: 'on-call-callback', path, data});
        };
        methods.current = getExposedMethods(callbacksStore, dispatch);
    }, []);

    return methods.current;
};
