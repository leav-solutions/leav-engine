import {type MutableRefObject} from 'react';
import {
    type AlertMessage,
    type CallbackFunction,
    type Callbacks,
    type CallCbFunction,
    type ClosePanelMessage,
    type ExplorerViewChangedMessage,
    type IEncodedMessage,
    type IUsePanelMessengerOptions,
    type GetUrlMessage,
    type Message,
    type MessageDispatcher,
    type MessageHandler,
    type MessageToPanelMessage,
    type ModalConfirmMessage,
    type NavigateToIframeMessage,
    type NavigateToPanelMessage,
    type NotificationMessage,
    packetId,
    type SimpleMessage,
    type OpenFlapPanelMessage,
    type GetPanelConfigMessage,
    type ViewSettingsUpdateMessage,
} from './types';

export const encodeMessage = (message: Message): string =>
    JSON.stringify({
        payload: JSON.stringify(message),
        [packetId]: true,
    });

export const decodeMessage = (raw: string): Message | undefined => {
    try {
        const decoded: IEncodedMessage = JSON.parse(raw) as unknown as IEncodedMessage;
        if (packetId in decoded && decoded[packetId] === true) {
            return JSON.parse(decoded.payload) as Message;
        }
    } catch {
        return undefined;
    }
    return undefined;
};

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
    frameId: string,
    data: unknown,
    callCb: CallCbFunction,
    overrides?: string[],
): unknown => {
    if (!overrides) {
        return data;
    }

    const nextData = {...(data as Record<string, unknown>)};
    overrides.forEach((key: string) => {
        nextData[key] = (...args: unknown[]) => {
            callCb(`${id}.${key}`, args, frameId);
        };
    });
    return nextData;
};

export const initClientHandlers: (
    callCb: CallCbFunction,
    options?: IUsePanelMessengerOptions,
    callbacksList?: MutableRefObject<Callbacks>,
) => MessageHandler = (callCb, options, callbacksList) => (message, dispatch) => {
    switch (message.type) {
        case 'modal-confirm':
            options?.handlers?.onModalConfirm?.(
                setCallbacks(
                    message.id,
                    message.__frameId,
                    message.data,
                    callCb,
                    message.overrides,
                ) as ModalConfirmMessage['data'],
                message.id,
                dispatch,
                callCb,
            );
            break;
        case 'alert':
            options?.handlers?.onAlert?.(
                setCallbacks(
                    message.id,
                    message.__frameId,
                    message.data,
                    callCb,
                    message.overrides,
                ) as AlertMessage['data'],
                message.id,
                dispatch,
                callCb,
            );
            break;
        case 'notification':
            options?.handlers?.onNotification?.(
                setCallbacks(
                    message.id,
                    message.__frameId,
                    message.data,
                    callCb,
                    message.overrides,
                ) as NotificationMessage['data'],
                message.id,
                dispatch,
                callCb,
            );
            break;
        case 'message':
            options?.handlers?.onMessage?.(message.data, message.id, dispatch, callCb);
            break;
        case 'on-call-callback':
            // TODO How to know if handler can be removed from callbacksList ?
            getCallback(message.path, callbacksList)?.(...(message.data as never[]));
            break;
        case 'navigate-to-panel':
            options?.handlers?.onNavigateToPanel?.(
                setCallbacks(
                    message.id,
                    message.__frameId,
                    message.data,
                    callCb,
                    message.overrides,
                ) as NavigateToPanelMessage['data'],
            );
            break;
        case 'close-panel':
            options?.handlers?.onClosePanel?.(message.data);
            break;
        case 'navigate-to-iframe':
            options?.handlers?.onNavigateToIframe?.(message.data);
            break;
        case 'open-flap-panel':
            options?.handlers?.onOpenFlapPanel?.(message.data);
            break;
        case 'close-flap-panel':
            options?.handlers?.onCloseFlapPanel?.();
            break;
        case 'get-panel-config':
            options?.handlers?.onGetPanelConfig?.(
                setCallbacks(
                    message.id,
                    message.__frameId,
                    message.data,
                    callCb,
                    message.overrides,
                ) as GetPanelConfigMessage['data'],
                message.id,
                dispatch,
                callCb,
            );
            break;
        case 'get-url':
            options?.handlers?.onGetUrl?.(
                setCallbacks(
                    message.id,
                    message.__frameId,
                    message.data,
                    callCb,
                    message.overrides,
                ) as GetUrlMessage['data'],
            );
            break;
        case 'explorer-view-changed':
            options?.handlers?.onExplorerViewChanged?.(message.data as ExplorerViewChangedMessage['data']);
            break;
        case 'view-settings-update':
            options?.handlers?.onViewConfigUpdate?.(message.data as ViewSettingsUpdateMessage['data']);
            break;
        default:
            break;
    }
};

const storeCallbacks = (
    data: unknown,
    id: string,
    callbacksStore: MutableRefObject<Callbacks>,
): {data: unknown; overrides: string[]} => {
    const nextData = {...(data as Record<string, unknown>)};
    const overrides: string[] = [];
    Object.entries(nextData).forEach(([key, value]) => {
        if (typeof value === 'function') {
            callbacksStore.current[id] = {
                ...callbacksStore.current[id],
                [key]: value as CallbackFunction,
            };
            overrides.push(key);
        }
    });
    return {data: nextData, overrides};
};

export const getExposedMethods = (callbacksStore: MutableRefObject<Callbacks>, dispatch?: MessageDispatcher) => ({
    showModalConfirm: (data: ModalConfirmMessage['data']) => {
        const id = Date.now().toString();
        const {data: nextData, overrides} = storeCallbacks(data, id, callbacksStore);
        dispatch?.({type: 'modal-confirm', data: nextData as ModalConfirmMessage['data'], id, overrides});
    },
    showAlert: (data: AlertMessage['data']) => {
        const id = Date.now().toString();
        const {data: nextData, overrides} = storeCallbacks(data, id, callbacksStore);
        dispatch?.({type: 'alert', data: nextData as AlertMessage['data'], id, overrides});
    },
    showNotification: (data: NotificationMessage['data']) => {
        const id = Date.now().toString();
        const {data: nextData, overrides} = storeCallbacks(data, id, callbacksStore);
        dispatch?.({type: 'notification', data: nextData as NotificationMessage['data'], id, overrides});
    },
    messageToParent: (data: SimpleMessage['data']) => {
        const id = Date.now().toString();
        dispatch?.({type: 'message', data, id});
    },
    navigateToPanel: (data: NavigateToPanelMessage['data']) => {
        const id = Date.now().toString();
        const {data: nextData, overrides} = storeCallbacks(data, id, callbacksStore);
        dispatch?.({type: 'navigate-to-panel', data: nextData as NavigateToPanelMessage['data'], id, overrides});
    },
    closePanel: (data: ClosePanelMessage['data']) => {
        dispatch?.({type: 'close-panel', data});
    },
    navigateToIframe: (data: NavigateToIframeMessage['data']) => {
        dispatch?.({type: 'navigate-to-iframe', data});
    },
    messageToPanel: (data: MessageToPanelMessage['data']) => {
        dispatch?.({type: 'message-to-panel', data});
    },
    openFlapPanel: (data: OpenFlapPanelMessage['data']) => {
        dispatch?.({type: 'open-flap-panel', data});
    },
    closeFlapPanel: () => {
        dispatch?.({type: 'close-flap-panel'});
    },
    getPanelConfig: (data: GetPanelConfigMessage['data']) => {
        const id = Date.now().toString();
        const {data: nextData, overrides} = storeCallbacks(data, id, callbacksStore);
        dispatch?.({type: 'get-panel-config', data: nextData as GetPanelConfigMessage['data'], id, overrides});
    },
    getUrl: (data: GetUrlMessage['data']) => {
        const id = Date.now().toString();
        const {data: nextData, overrides} = storeCallbacks(data, id, callbacksStore);
        dispatch?.({type: 'get-url', data: nextData as GetUrlMessage['data'], id, overrides});
    },
    explorerViewChanged: (data: ExplorerViewChangedMessage['data']) => {
        dispatch?.({type: 'explorer-view-changed', data});
    },
});
