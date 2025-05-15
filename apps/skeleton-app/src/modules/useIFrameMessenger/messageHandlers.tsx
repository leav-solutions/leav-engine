// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type MutableRefObject} from 'react';
import {
    type Callbacks,
    type Message,
    type IUseIFrameMessengerOptions,
    type CallCbFunction,
    type CallbackFunction,
    type ISidePanelFormMessage,
    type ISidePanelIFrameMessage,
    type IModalConfirmMessage,
    type Dispatch,
    type IModalFormMessage,
    type IAlertMessage,
    type INotificationMessage
} from './types';
import {type MessageHandler} from 'use-iframe';

const getCallback = (path: string, callbacksList?: MutableRefObject<Callbacks>): CallbackFunction | null => {
    if (!callbacksList?.current) {
        return null;
    }
    const pathArray = path.split('.');
    let callback: CallbackFunction | Callbacks | Record<string, CallbackFunction> = callbacksList.current;
    pathArray.forEach(part => (callback = (callback as Callbacks | Record<string, CallbackFunction>)?.[part]));
    return typeof callback === 'function' ? callback : null;
};

const setCallbacks = (
    id: string,
    data: unknown,
    callCb: MutableRefObject<CallCbFunction>,
    overrides?: string[]
): unknown => {
    if (!overrides) {
        return data;
    }

    const nextData = {...(data as Record<string, unknown>)};
    overrides.forEach((key: string) => {
        nextData[key] = (...args: unknown[]) => {
            callCb.current(`${id}.${key}`, args);
        };
    });
    return nextData;
};

export const initMessageHandlers: (
    callCb: MutableRefObject<CallCbFunction>,
    options?: IUseIFrameMessengerOptions,
    callbacksList?: MutableRefObject<Callbacks>
) => MessageHandler<Message> = (callCb, options, callbacksList) => (message, dispatch) => {
    switch (message.type) {
        case 'sidepanel-form':
            options?.handlers?.onSidePanelForm?.(
                setCallbacks(message.id, message.data, callCb, message.overrides) as ISidePanelFormMessage['data'],
                dispatch,
                callCb.current
            );
            break;
        case 'sidepanel-iframe':
            options?.handlers?.onSidePanelIframe?.(message.url, dispatch, callCb.current);
            break;
        case 'modal-confirm':
            options?.handlers?.onModalConfirm?.(
                setCallbacks(message.id, message.data, callCb, message.overrides) as IModalConfirmMessage['data'],
                message.id,
                dispatch,
                callCb.current
            );
            break;
        case 'modal-form':
            options?.handlers?.onModalForm?.(
                setCallbacks(message.id, message.data, callCb, message.overrides) as IModalFormMessage['data'],
                message.id,
                dispatch,
                callCb.current
            );
            break;
        case 'alert':
            options?.handlers?.onAlert?.(
                setCallbacks(message.id, message.data, callCb, message.overrides) as IAlertMessage['data'],
                message.id,
                dispatch,
                callCb.current
            );
            break;
        case 'notification':
            options?.handlers?.onNotification?.(
                setCallbacks(message.id, message.data, callCb, message.overrides) as INotificationMessage['data'],
                message.id,
                dispatch,
                callCb.current
            );
            break;
        case 'on-call-callback':
            getCallback(message.path, callbacksList)?.(message.data as never);
            break;
        default:
            break;
    }
};

const storeCallbacks = (
    data: unknown,
    id: string,
    callbacksStore: MutableRefObject<Callbacks>
): {data: unknown; overrides: string[]} => {
    const nextData = {...(data as Record<string, unknown>)};
    const overrides: string[] = [];
    Object.entries(nextData).forEach(([key, value]) => {
        if (typeof value === 'function') {
            callbacksStore.current[id] = {
                ...callbacksStore.current[id],
                [key]: value as CallbackFunction
            };
            overrides.push(key);
        }
    });
    return {data: nextData, overrides};
};

export const getExposedMethods = (callbacksStore: MutableRefObject<Callbacks>, dispatch?: Dispatch) => ({
    showSidePanelForm: (data: ISidePanelFormMessage['data']) => {
        dispatch?.({type: 'sidepanel-form', data, id: Date.now().toString()});
    },
    showSidePanelIFrame: (url: ISidePanelIFrameMessage['url']) => {
        dispatch?.({type: 'sidepanel-iframe', url, id: Date.now().toString()});
    },
    showModalConfirm: (data: IModalConfirmMessage['data']) => {
        const id = Date.now().toString();
        const {data: nextData, overrides} = storeCallbacks(data, id, callbacksStore);
        dispatch?.({type: 'modal-confirm', data: nextData as IModalConfirmMessage['data'], id, overrides});
    },
    showModalForm: (data: IModalFormMessage['data']) => {
        const id = Date.now().toString();
        const {data: nextData, overrides} = storeCallbacks(data, id, callbacksStore);
        dispatch?.({type: 'modal-form', data: nextData as IModalFormMessage['data'], id, overrides});
    },
    showAlert: (data: IAlertMessage['data']) => {
        const id = Date.now().toString();
        const {data: nextData, overrides} = storeCallbacks(data, id, callbacksStore);
        dispatch?.({type: 'alert', data: nextData as IAlertMessage['data'], id, overrides});
    },
    showNotification: (data: INotificationMessage['data']) => {
        const id = Date.now().toString();
        const {data: nextData, overrides} = storeCallbacks(data, id, callbacksStore);
        dispatch?.({type: 'notification', data: nextData as INotificationMessage['data'], id, overrides});
    }
});
