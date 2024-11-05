// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEditRecordModalProps} from '_ui/components/RecordEdition/EditRecordModal/EditRecordModal';
import {createContext} from 'react';

export interface IEditRecordContextType {
    editRecord: (props: IEditRecordModalProps) => void;
}

export const EditRecordModalContext = createContext<IEditRecordContextType>({
    editRecord: () => {
        throw new Error('Not implemented');
    }
});
