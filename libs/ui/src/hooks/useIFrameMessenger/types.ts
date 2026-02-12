// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type RefObject, type ComponentProps, type Key, type JSXElementConstructor} from 'react';
import type * as z from 'zod/v4';
import {type KitNotification} from 'aristid-ds';
import {type IKitConfirmDialog} from 'aristid-ds/dist/Kit/Feedback/Modal/types';
import {type ToastedAlertProps} from 'aristid-ds/dist/Kit/Feedback/Alert/types';
import {
    type LibraryIdSchema,
    type WhereSchema,
    type PanelIdSchema,
    type PanelSchema,
    type PanelIFrameSchema,
    type FlapPanelIdSchema,
    type attributeExplorerPanelSchema,
    type baseExplorerPanelSchema,
} from '_ui/hooks/useIFrameMessenger/schema';
import {type AnyPrimitive} from '@leav/utils';
import {type IRecordIdentity, type ITreeNodeWithRecord} from '_ui/types';

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

export type ModalConfirmMessage = IMessageBase & {
    type: 'modal-confirm';
    id: string;
    data: IKitConfirmDialog;
    overrides?: string[];
};

export type AlertMessage = IMessageBase & {
    type: 'alert';
    id: string;
    data: ToastedAlertProps;
    overrides?: string[];
};

export type NotificationMessage = IMessageBase & {
    type: 'notification';
    id: string;
    data: ComponentPropsWithKey<typeof KitNotification>;
    overrides?: string[];
};

export type ChangeLanguageMessage = IMessageBase & {
    type: 'change-language';
    language: string;
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

export type UnregisterMessage = IMessageBase & {
    type: 'unregister';
    id: string;
};

export type Panel = z.infer<typeof PanelSchema>;

export type AttributeExplorerPanel = Panel &
    z.infer<typeof baseExplorerPanelSchema> &
    z.infer<typeof attributeExplorerPanelSchema>;

export type LibraryId = z.infer<typeof LibraryIdSchema>;

export type PanelId = z.infer<typeof PanelIdSchema>;

export type Where = z.infer<typeof WhereSchema>;

export type PanelIFrame = z.infer<typeof PanelIFrameSchema>;

type FlapPanelId = z.infer<typeof FlapPanelIdSchema>;

export type NavigateToPanelMessage = IMessageBase & {
    type: 'navigate-to-panel';
    data: {
        where: Where;
        libraryId: LibraryId;
        panelId?: PanelId;
        recordId?: string;
        flapRecordId?: string;
        flapLibraryId?: LibraryId;
        flapPanelId?: FlapPanelId;
        queryParams?: Record<string, string> & {
            formInitialValues?: Record<string, Array<AnyPrimitive | IRecordIdentity | ITreeNodeWithRecord>>;
        };
    };
};

export type ClosePanelMessage = IMessageBase & {
    type: 'close-panel';
    data: {
        recordId: string;
        where: string;
        recordPanelId: string;
    };
};

export type NavigateToIframeMessage = IMessageBase & {
    type: 'navigate-to-iframe';
    data: {
        panel: PanelIFrame;
        destination: {libraryId: LibraryId};
        where: Where;
        recordId: string;
        recordPanelId: string;
    };
};

export type MessageToPanelMessage = IMessageBase & {
    type: 'message-to-panel';
    data: {
        type: string;
        target?: string;
        payload: unknown;
    };
};

export type OpenFlapPanelMessage = IMessageBase & {
    type: 'open-flap-panel';
    data: {
        flapRecordId: string;
        flapLibraryId: LibraryId;
        flapPanelId: FlapPanelId;
        redirectUrl?: string;
    };
};

export type CloseFlapPanelMessage = IMessageBase & {
    type: 'close-flap-panel';
};

export type GetUrlMessage = IMessageBase & {
    type: 'get-url';
    id: string;
    data: {
        onGetUrl: (url: string) => void;
        flapParams?: {
            flapRecordId: string;
            flapLibraryId: LibraryId;
            flapPanelId: FlapPanelId;
        };
        panelParams?: {
            recordId: string;
            where: Where;
            recordPanelId: PanelId;
        };
    };
    overrides?: string[];
};

export type GetPanelConfigMessage = IMessageBase & {
    type: 'get-panel-config';
    id: string;
    data: {
        panelId?: string;
        onGetPanelConfig: (data: PanelIFrame) => void;
    };
    overrides?: string[];
};

export type MessageToParent =
    | ModalConfirmMessage
    | AlertMessage
    | NotificationMessage
    | SimpleMessage
    | RegisterMessage
    | UnregisterMessage
    | NavigateToPanelMessage
    | ClosePanelMessage
    | NavigateToIframeMessage
    | MessageToPanelMessage
    | OpenFlapPanelMessage
    | CloseFlapPanelMessage
    | GetUrlMessage
    | GetPanelConfigMessage;

export type MessageFromParent =
    | (IMessageBase & {
          type: 'on-call-callback';
          path: string;
          data: unknown;
      })
    | ChangeLanguageMessage;

export type Message = MessageToParent | MessageFromParent;

export type MessageHandler<T = Message> = (message: T, dispatch: MessageDispatcher<T>) => void;
export type MessageDispatcher<T = Message> = (message: T, frameId?: string) => void;

export type CallCbFunction = (path: string, data: unknown, frameId: string) => void;

export type CallbackFunction = (...args: never[]) => void;
export type Callbacks = Record<string, Record<string, CallbackFunction>>;

export type MessageToPanelMessageHandler = (data: MessageToPanelMessage['data']['payload']) => void;
export type AddMessageToPanelMessageHandler = (type: string, handler: MessageToPanelMessageHandler) => void;

export interface IUseIFrameMessengerOptions {
    ref?: RefObject<HTMLIFrameElement>;
    id?: string;
    handlers?: {
        onModalConfirm?: (
            data: ModalConfirmMessage['data'],
            id: string,
            dispatch: MessageDispatcher,
            callCb: CallCbFunction,
        ) => void;
        onAlert?: (data: AlertMessage['data'], id: string, dispatch: MessageDispatcher, callCb: CallCbFunction) => void;
        onNotification?: (
            data: NotificationMessage['data'],
            id: string,
            dispatch: MessageDispatcher,
            callCb: CallCbFunction,
        ) => void;
        onMessage?: (data: unknown, id: string, dispatch: MessageDispatcher, callCb: CallCbFunction) => void;
        onNavigateToPanel?: (data: NavigateToPanelMessage['data']) => void;
        onClosePanel?: (data: ClosePanelMessage['data']) => void;
        onNavigateToIframe?: (data: NavigateToIframeMessage['data']) => void;
        onOpenFlapPanel?: (data: OpenFlapPanelMessage['data']) => void;
        onGetUrl?: (data: GetUrlMessage['data']) => void;
        onGetPanelConfig?: (
            data: GetPanelConfigMessage['data'],
            id: string,
            dispatch: MessageDispatcher,
            callCb: CallCbFunction,
        ) => void;
        onCloseFlapPanel?: () => void;
    };
}
