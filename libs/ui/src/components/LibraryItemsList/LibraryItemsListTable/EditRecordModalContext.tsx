// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext, FunctionComponent, useCallback, useContext, useMemo, useState} from 'react';
import {EditRecordModal, IEditRecordModalProps} from '_ui/components/RecordEdition/EditRecordModal/EditRecordModal';

export interface IEditRecordContextType {
    editRecord: (props: IEditRecordModalProps) => void;
}

const EditRecordModalContext = createContext<IEditRecordContextType>({
    editRecord: () => null
});

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

// eslint-disable-next-line react-refresh/only-export-components
export const useEditRecordModalContext = () => useContext(EditRecordModalContext);
