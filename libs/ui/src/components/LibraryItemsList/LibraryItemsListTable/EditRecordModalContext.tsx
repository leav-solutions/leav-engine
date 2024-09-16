// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext} from 'react';
import {IEditRecordModalProps} from '_ui/components/RecordEdition/EditRecordModal/EditRecordModal';

export interface IEditRecordContextType {
    editRecord: (props: IEditRecordModalProps) => void;
}

export const EditRecordModalContext = createContext<IEditRecordContextType>({
    editRecord: () => null
});
