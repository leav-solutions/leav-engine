// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {EditRecordModal} from '@leav/ui';
import {ComponentPropsWithKey, IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';

export const useModalForm = () => {
    const [editRecordModalProps, setEditRecordModalProps] = useState<
        ComponentPropsWithKey<typeof EditRecordModal> | {open: false} | null
    >(null);

    const closeModalForm = () => setEditRecordModalProps(null);
    const openModalForm: IUseIFrameMessengerOptions['handlers']['onModalForm'] = data => {
        if (data.open === false) {
            closeModalForm();
        } else {
            setEditRecordModalProps({
                ...data,
                open: true,
                key: Date.now(),
                onClose: () => {
                    closeModalForm();
                    data.onClose();
                }
            });
        }
    };

    return {
        openModalForm,
        CustomModalForm: (
            <EditRecordModal
                onClose={null /* TODO: find why mandatory */}
                open={false}
                record={null}
                library={null}
                {...(editRecordModalProps ?? {})}
            />
        )
    };
};
