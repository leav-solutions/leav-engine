// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useCallback, useMemo, useState} from 'react';
import {EditRecordModal, IEditRecordModalProps} from '_ui/components/RecordEdition/EditRecordModal/EditRecordModal';
import {EditRecordModalContext} from '_ui/components/LibraryItemsList/LibraryItemsListTable/EditRecordModalContext';

export interface IEditRecordContextType {
    editRecord: (props: IEditRecordModalProps) => void;
}

export const EditRecordModalProvider: FunctionComponent = props => {
    const [editRecordModalProps, setEditRecordModalProps] = useState<IEditRecordModalProps | null>(null);

    const _onClose = useCallback(() => {
        editRecordModalProps?.onClose();

        setEditRecordModalProps(null);
    }, [editRecordModalProps, setEditRecordModalProps]);

    const value = useMemo<IEditRecordContextType>(
        () => ({
            editRecord: recordProps => {
                setEditRecordModalProps(recordProps);
            }
        }),
        [setEditRecordModalProps]
    );

    return (
        <EditRecordModalContext.Provider value={value}>
            {props.children}
            {editRecordModalProps && (
                <EditRecordModal {...editRecordModalProps} open={editRecordModalProps !== null} onClose={_onClose} />
            )}
        </EditRecordModalContext.Provider>
    );
};
