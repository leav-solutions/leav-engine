import {type IEditRecordModalProps} from '_ui/components/RecordEdition/EditRecordModal/EditRecordModal';
import {createContext} from 'react';

export interface IEditRecordContextType {
    editRecord: (props: IEditRecordModalProps) => void;
}

export const EditRecordModalContext = createContext<IEditRecordContextType>({
    editRecord: () => {
        throw new Error('Not implemented');
    },
});
