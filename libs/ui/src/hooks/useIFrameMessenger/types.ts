// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EditRecordPage} from '_ui/components/RecordEdition/EditRecordPage';
import {type KitNotification, type KitAlert} from 'aristid-ds';
import {type IKitConfirmDialog} from 'aristid-ds/dist/Kit/Feedback/Modal/types';
import {type RefObject, type ComponentProps, type Key, type JSXElementConstructor} from 'react';

export const packetId = '__fromIframeMessenger';

export interface IEncodedMessage {
    payload: string;
    [packetId]: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentPropsWithKey<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> =
    ComponentProps<T> & {
        key?: Key;
    };

export interface IMessageBase {
    __frameId?: string;
}

export type SidePanelFormMessage = IMessageBase & {
    type: 'sidepanel-form';
    id: string;
    data: ComponentPropsWithKey<typeof EditRecordPage>;
    overrides?: string[];
};
export type ModalConfirmMessage = IMessageBase & {
    type: 'modal-confirm';
    id: string;
    data: IKitConfirmDialog;
    overrides?: string[];
};
export type ModalFormMessage = IMessageBase & {
    type: 'modal-form';
    id: string;
    data: ComponentPropsWithKey<typeof EditRecordPage>;
    overrides?: string[];
};
export type AlertMessage = IMessageBase & {
    type: 'alert';
    id: string;
    data: ComponentPropsWithKey<typeof KitAlert>;
    overrides?: string[];
};
export type NotificationMessage = IMessageBase & {
    type: 'notification';
    id: string;
    data: ComponentPropsWithKey<typeof KitNotification>;
    overrides?: string[];
};

export type SimpleMessage = IMessageBase & {
    type: 'message';
    id: string;
    data: unknown;
};

export type RegisterMessage = IMessageBase & {
    type: 'register';
    id: string;
};

export type MessageToParent =
    | SidePanelFormMessage
    | ModalConfirmMessage
    | ModalFormMessage
    | AlertMessage
    | NotificationMessage
    | SimpleMessage
    | RegisterMessage;

export type MessageFromParent = IMessageBase & {
    type: 'on-call-callback';
    path: string;
    data: unknown;
};

export type Message = MessageToParent | MessageFromParent;

export type MessageHandler<T = Message> = (message: T, dispatch: MessageDispatcher<T>) => void;
export type MessageDispatcher<T = Message> = (message: T, frameId?: string) => void;

export type CallCbFunction = (path: string, data: unknown, frameId: string) => void;

export type CallbackFunction = (...args: never[]) => void;
export type Callbacks = Record<string, Record<string, CallbackFunction>>;

export interface IUseIFrameMessengerOptions {
    ref?: RefObject<HTMLIFrameElement>;
    id?: string;
    handlers?: {
        onSidePanelForm?: (
            data: SidePanelFormMessage['data'],
            dispatch: MessageDispatcher,
            callCb: CallCbFunction
        ) => void;
        onModalConfirm?: (
            data: ModalConfirmMessage['data'],
            id: string,
            dispatch: MessageDispatcher,
            callCb: CallCbFunction
        ) => void;
        onModalForm?: (
            data: ModalFormMessage['data'],
            id: string,
            dispatch: MessageDispatcher,
            callCb: CallCbFunction
        ) => void;
        onAlert?: (data: AlertMessage['data'], id: string, dispatch: MessageDispatcher, callCb: CallCbFunction) => void;
        onNotification?: (
            data: NotificationMessage['data'],
            id: string,
            dispatch: MessageDispatcher,
            callCb: CallCbFunction
        ) => void;
        onMessage?: (data: unknown, id: string, dispatch: MessageDispatcher, callCb: CallCbFunction) => void;
    };
}
