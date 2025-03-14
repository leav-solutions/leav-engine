// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {EditRecordModal} from '_ui/components/RecordEdition/EditRecordModal';
import {CREATE_RECORD_MODAL_CLASSNAME} from '_ui/components/Explorer/_constants';

interface IUseCreateRecordProps {
    linkRecords: (recordIds: string[]) => void;
}

export const useCreateRecord = ({linkRecords}: IUseCreateRecordProps) => {
    const [libraryId, setLibraryId] = useState<null | string>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = (libraryIdParam: string) => {
        setLibraryId(libraryIdParam);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return {
        openModal,
        CreateRecordModal:
            isModalVisible && libraryId !== null ? (
                <EditRecordModal
                    className={CREATE_RECORD_MODAL_CLASSNAME}
                    open
                    record={null}
                    library={libraryId}
                    onClose={closeModal}
                    onCreate={newRecord => {
                        linkRecords([newRecord.id]);
                        closeModal();
                    }}
                    submitButtons={['create']}
                />
            ) : null
    };
};
