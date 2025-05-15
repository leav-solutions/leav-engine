// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type EditRecordPage} from '@leav/ui';
import {type KitNotification, type KitAlert} from 'aristid-ds';
import {type IKitConfirmDialog} from 'aristid-ds/dist/Kit/Feedback/Modal/types';
import {type RefObject, type ComponentProps, Key, JSXElementConstructor} from 'react';
import {type MessageHandler} from 'use-iframe';

export type ComponentPropsWithKey<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> = ComponentProps<T> & {
    key?: Key;
};

export interface ISidePanelFormMessage {
    type: 'sidepanel-form';
    id: string;
    data: ComponentPropsWithKey<typeof EditRecordPage>;
    overrides?: string[];
}
export interface ISidePanelIFrameMessage {
    type: 'sidepanel-iframe';
    id: string;
    url: string;
    overrides?: string[];
}
export interface IModalConfirmMessage {
    type: 'modal-confirm';
    id: string;
    data: IKitConfirmDialog;
    overrides?: string[];
}
export interface IModalFormMessage {
    type: 'modal-form';
    id: string;
    data: ComponentPropsWithKey<typeof EditRecordPage>;
    overrides?: string[];
}
export interface IAlertMessage {
    type: 'alert';
    id: string;
    data: ComponentPropsWithKey<typeof KitAlert>;
    overrides?: string[];
}
export interface INotificationMessage {
    type: 'notification';
    id: string;
    data: ComponentPropsWithKey<typeof KitNotification>;
    overrides?: string[];
}

export type MessageToParent =
    | ISidePanelFormMessage
    | ISidePanelIFrameMessage
    | IModalConfirmMessage
    | IModalFormMessage
    | IAlertMessage
    | INotificationMessage;

export interface IMessageFromParent {
    type: 'on-call-callback';
    path: string;
    data: unknown;
}

export type Message = MessageToParent | IMessageFromParent;

export type Dispatch = Parameters<MessageHandler<Message>>[1];

export type CallCbFunction = (path: string, data: unknown) => void;

export type CallbackFunction = (...args: never[]) => void;
export type Callbacks = Record<string, Record<string, CallbackFunction>>;

export interface IUseIFrameMessengerOptions {
    ref?: RefObject<HTMLIFrameElement>;
    handlers?: {
        onSidePanelForm?: (data: ISidePanelFormMessage['data'], dispatch: Dispatch, callCb: CallCbFunction) => void;
        onSidePanelIframe?: (url: ISidePanelIFrameMessage['url'], dispatch: Dispatch, callCb: CallCbFunction) => void;
        onModalConfirm?: (
            data: IModalConfirmMessage['data'],
            id: string,
            dispatch: Dispatch,
            callCb: CallCbFunction
        ) => void;
        onModalForm?: (data: IModalFormMessage['data'], id: string, dispatch: Dispatch, callCb: CallCbFunction) => void;
        onAlert?: (data: IAlertMessage['data'], id: string, dispatch: Dispatch, callCb: CallCbFunction) => void;
        onNotification?: (
            data: INotificationMessage['data'],
            id: string,
            dispatch: Dispatch,
            callCb: CallCbFunction
        ) => void;
    };
}
