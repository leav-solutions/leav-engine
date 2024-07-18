import React, {FunctionComponent, useContext, useState} from 'react';
import {EditRecordModal, IEditRecordModalProps} from '_ui/components/RecordEdition/EditRecordModal/EditRecordModal';

export interface IEditRecordContextType {
    editRecord: (props: IEditRecordModalProps) => void;
}

const EditRecordModalContext = React.createContext<IEditRecordContextType>({
    editRecord: () => null
});

export const EditRecordModalProvider: FunctionComponent = props => {
    const [editRecordModalProps, setEditRecordModalProps] = useState<IEditRecordModalProps>(null);

    const _onClose = () => {
        if (editRecordModalProps.onClose) {
            editRecordModalProps.onClose();
        }
        setEditRecordModalProps(null);
    };

    const value: IEditRecordContextType = {
        editRecord: recordProps => {
            setEditRecordModalProps(recordProps);
        }
    };

    return (
        <EditRecordModalContext.Provider value={value}>
            {props.children}
            {editRecordModalProps && (
                <EditRecordModal {...editRecordModalProps} open={editRecordModalProps !== null} onClose={_onClose} />
            )}
        </EditRecordModalContext.Provider>
    );
};

export default EditRecordModalContext;
