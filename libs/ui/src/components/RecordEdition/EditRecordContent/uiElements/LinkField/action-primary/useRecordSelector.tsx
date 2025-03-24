// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {SelectRecordForLinkModal} from '_ui/components/SelectRecordForLinkModal';
import {LINK_RECORDS_MODAL_CLASSNAME} from '_ui/components/Explorer/_constants';

type SelectionMode = 'simple' | 'multiple';

interface IUseRecordSelectorProps {
    libraryId: string;
    selectionMode: SelectionMode;
    isReplacementMode: boolean;
    linkRecords: (recordIds: string[]) => void;
}

export const useRecordSelector = ({
    libraryId,
    selectionMode,
    isReplacementMode,
    linkRecords
}: IUseRecordSelectorProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return {
        openModal,
        RecordSelectorModal: isModalVisible ? (
            <SelectRecordForLinkModal
                className={LINK_RECORDS_MODAL_CLASSNAME}
                open
                replacementMode={isReplacementMode}
                childLibraryId={libraryId}
                selectionMode={selectionMode}
                hideSelectAllAction={selectionMode !== 'multiple'}
                onSelectionCompleted={data => {
                    linkRecords(data.records.list.map(record => record.id));
                    closeModal();
                }}
                onClose={closeModal}
            />
        ) : null
    };
};
