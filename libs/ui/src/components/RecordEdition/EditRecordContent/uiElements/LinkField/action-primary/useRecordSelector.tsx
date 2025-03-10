// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {ExplorerSelectionIdsQuery} from '_ui/_gqlTypes';
import {SelectRecordForLinkModal} from '_ui/components/SelectRecordForLinkModal';
import {IExplorerFilterStandard} from '_ui/components/Explorer/_types';
import {FILTER_ON_ID_DEFAULT_FIELDS, NO_RECORD_FILTERS} from '../shared/utils';

type SelectionMode = 'simple' | 'multiple';

interface IUseRecordSelectorProps {
    libraryId: string;
    selectionMode: SelectionMode;
    selectedRecordIds: string[];
    setSelectedRecordIds: (recordIds: string[]) => void;
    explorerFilters: IExplorerFilterStandard[];
    setExplorerFilters: (filters: IExplorerFilterStandard[]) => void;
    updateExplorerKey: () => void;
}

export const useRecordSelector = ({
    libraryId,
    selectionMode,
    selectedRecordIds,
    setSelectedRecordIds,
    explorerFilters,
    setExplorerFilters,
    updateExplorerKey
}: IUseRecordSelectorProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const handleSelectionCompleted = (data: ExplorerSelectionIdsQuery) => {
        const newSelectedRecordIds = data.records.list.map(record => record.id);
        setSelectedRecordIds([...selectedRecordIds, ...newSelectedRecordIds]);

        const newFilters = newSelectedRecordIds.map(id => ({
            ...FILTER_ON_ID_DEFAULT_FIELDS,
            value: id
        }));
        const filers = [...explorerFilters, ...newFilters];
        setExplorerFilters(filers.length > 0 ? filers : NO_RECORD_FILTERS);

        updateExplorerKey();
        closeModal();
    };

    return {
        openModal,
        RecordSelectorModal: isModalVisible ? (
            <SelectRecordForLinkModal
                open
                childLibraryId={libraryId}
                selectionMode={selectionMode}
                hideSelectAllAction={selectionMode !== 'multiple'}
                onSelectionCompleted={handleSelectionCompleted}
                onClose={closeModal}
            />
        ) : null
    };
};
