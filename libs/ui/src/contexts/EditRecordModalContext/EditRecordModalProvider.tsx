import {type FunctionComponent, useCallback, useMemo, useState} from 'react';
import {
    EditRecordModal,
    type IEditRecordModalProps,
} from '_ui/components/RecordEdition/EditRecordModal/EditRecordModal';
import {type IEditRecordContextType, EditRecordModalContext} from './EditRecordModalContext';

export const EditRecordModalProvider: FunctionComponent = ({children}) => {
    const [editRecordModalProps, setEditRecordModalProps] = useState<IEditRecordModalProps | null>(null);

    const _onClose = useCallback(() => {
        editRecordModalProps?.onClose();

        setEditRecordModalProps(null);
    }, [editRecordModalProps, setEditRecordModalProps]);

    const value = useMemo<IEditRecordContextType>(
        () => ({
            editRecord: recordProps => {
                setEditRecordModalProps(recordProps);
            },
        }),
        [setEditRecordModalProps],
    );

    return (
        <EditRecordModalContext.Provider value={value}>
            {children}
            {editRecordModalProps && <EditRecordModal {...editRecordModalProps} onClose={_onClose} />}
        </EditRecordModalContext.Provider>
    );
};
