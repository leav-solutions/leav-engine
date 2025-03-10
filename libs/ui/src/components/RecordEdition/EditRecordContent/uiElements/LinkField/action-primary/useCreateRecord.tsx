// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {ExplorerSelectionIdsQuery} from '_ui/_gqlTypes';
import {SelectRecordForLinkModal} from '_ui/components/SelectRecordForLinkModal';
import {IExplorerFilterStandard, IItemData} from '_ui/components/Explorer/_types';
import {FILTER_ON_ID_DEFAULT_FIELDS, NO_RECORD_FILTERS} from '../shared/utils';
import {EditRecordModal} from '_ui/components/RecordEdition/EditRecordModal';

interface IUseCreateRecordProps {
    selectedRecordIds: string[];
    setSelectedRecordIds: (selectedRecordIds: string[]) => void;
    explorerFilters: IExplorerFilterStandard[];
    setExplorerFilters: (filters: IExplorerFilterStandard[]) => void;
    updateExplorerKey: () => void;
}

export const useCreateRecord = ({
    selectedRecordIds,
    setSelectedRecordIds,
    explorerFilters,
    setExplorerFilters,
    updateExplorerKey
}: IUseCreateRecordProps) => {
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
                    open
                    record={null}
                    library={libraryId}
                    onClose={closeModal}
                    onCreate={newRecord => {
                        setSelectedRecordIds([...selectedRecordIds, newRecord.id]);

                        const newFilter = {
                            ...FILTER_ON_ID_DEFAULT_FIELDS,
                            value: newRecord.id
                        };
                        const filers = [...explorerFilters, newFilter];
                        setExplorerFilters(filers.length > 0 ? filers : NO_RECORD_FILTERS);

                        updateExplorerKey();
                        closeModal();
                    }}
                    submitButtons={['create']}
                />
            ) : null
    };
};
