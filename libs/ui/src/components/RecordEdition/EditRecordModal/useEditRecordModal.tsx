// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EditRecordModal, type IEditRecordModalProps} from './EditRecordModal';
import {useState} from 'react';

type EditRecordModalProps = Omit<IEditRecordModalProps, 'open' | 'onClose'> & {onClose?: () => void};

/**
 * This hook is used to open the edit record modal for explorer outside app-studio (e.g. in form)

 * @returns `{EditRecordModal: Component that will be rendered, openEditRecordModal: Function to open the modal}`
 */
export const useEditRecordModal = () => {
    const [editRecordModalProps, setEditRecordModalProps] = useState<EditRecordModalProps | null>(null);

    return {
        EditRecordModal: editRecordModalProps && (
            <EditRecordModal
                {...editRecordModalProps}
                open
                onClose={() => {
                    if (editRecordModalProps && editRecordModalProps.onClose) {
                        editRecordModalProps.onClose();
                    }
                    setEditRecordModalProps(null);
                }}
            />
        ),
        openEditRecordModal: (props: EditRecordModalProps) => setEditRecordModalProps(props)
    };
};
