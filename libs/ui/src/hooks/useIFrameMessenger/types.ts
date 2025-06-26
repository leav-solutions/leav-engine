// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type KitNotification} from 'aristid-ds';
import {type IKitConfirmDialog} from 'aristid-ds/dist/Kit/Feedback/Modal/types';
import {type RefObject, type ComponentProps, type Key, type JSXElementConstructor} from 'react';
import {EditRecordModal, Explorer} from '_ui/components';
import {ToastedAlertProps} from 'aristid-ds/dist/Kit/Feedback/Alert/types';

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
    data: ComponentPropsWithKey<typeof EditRecordModal>;
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
    data: ComponentPropsWithKey<typeof EditRecordModal> | {open: false};
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

export type NavigateToPanelMessage = IMessageBase & {
    type: 'navigate-to-panel';
    data: {panelId: string} | {panel: Panel; panelId: PanelId};
};

type PanelId = string;

export interface ICommonExplorerProps {
    showSearch?: boolean;
    defaultActionsForItem?: ComponentProps<typeof Explorer>['defaultActionsForItem'];
    defaultPrimaryActions?: ComponentProps<typeof Explorer>['defaultPrimaryActions'];
    defaultMassActions?: ComponentProps<typeof Explorer>['defaultMassActions'];
    showFiltersAndSorts?: boolean;
    freezeView?: boolean;
    showAttributeLabels?: boolean;
    creationFormId?: string;
    editionFormId?: string;
}

export type LinkExplorerProps = ICommonExplorerProps;

export type LibraryExplorerProps = {
    noPagination?: true;
} & ICommonExplorerProps;

export type ItemActions = Array<{
    what: Panel; // | WorkspaceId
    where: 'popup' | 'slider' | 'fullpage';
}>;

export type Panel = {
    id: PanelId;
    name: Record<string, string>;
} & (
    | {
          content:
              | {
                    type: 'explorer';
                    attributeSource: string;
                    explorerProps?: LinkExplorerProps;
                    viewId?: string | null;
                    actions: ItemActions;
                }
              | {
                    type: 'explorer';
                    libraryId: '<props>' | string;
                    explorerProps?: LibraryExplorerProps;
                    viewId?: string | null;
                    actions: ItemActions;
                }
              | {
                    type: 'custom';
                    iframeSource: string;
                }
              | {
                    type: 'editionForm';
                    formId: string;
                }
              | {
                    type: 'creationForm';
                    formId: string;
                };
          child?: Panel;
      }
    | {
          children: Panel[];
      }
);

export type MessageToParent =
    | SidePanelFormMessage
    | ModalConfirmMessage
    | ModalFormMessage
    | AlertMessage
    | NotificationMessage
    | SimpleMessage
    | RegisterMessage
    | NavigateToPanelMessage;

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

export interface IUseIFrameMessengerOptions {
    ref?: RefObject<HTMLIFrameElement>;
    id?: string;
    handlers?: {
        onSidePanelForm?: (
            data: SidePanelFormMessage['data'],
            id: string,
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
        onNavigateToPanel?: (data: NavigateToPanelMessage['data']) => void;
    };
}
