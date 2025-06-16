// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitModal} from 'aristid-ds';
import {IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';

export const useOpenConfirmModal = () => {
    const openConfirmModal: IUseIFrameMessengerOptions['handlers']['onModalConfirm'] = data => {
        KitModal[data.type]?.({
            type: data.type,
            title: data.title,
            content: data.content,
            okCancel: true,
            onOk: data.onOk,
            onCancel: data.onCancel,
            width: '50vw'
        });
    };

    return {
        openConfirmModal
    };
};
