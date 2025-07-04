// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {EditRecordModal} from '@leav/ui';
import {ComponentPropsWithKey} from '_ui/hooks/useIFrameMessenger/types';

export type EditRecordModalInPopupPanelProps = ComponentPropsWithKey<typeof EditRecordModal> | {open: false};

export const usePopupPanelForm = () => {
    const [editRecordModalProps, setEditRecordModalProps] = useState<EditRecordModalInPopupPanelProps>({open: false});

    const closePopupPanelForm = () => setEditRecordModalProps({open: false});

    const openPopupPanelForm = (data: EditRecordModalInPopupPanelProps) => {
        if (data.open === false) {
            closePopupPanelForm();
        } else {
            setEditRecordModalProps({
                ...data,
                open: true,
                key: Date.now(),
                onClose: () => {
                    closePopupPanelForm();
                    data.onClose();
                }
            });
        }
    };

    return {
        openPopupPanelForm,
        PopupPanelForm: (
            <EditRecordModal
                onClose={null /* TODO: find why mandatory */}
                open={editRecordModalProps.open}
                record={null}
                library={null}
                {...(editRecordModalProps ?? {})}
            />
        )
    };
};
