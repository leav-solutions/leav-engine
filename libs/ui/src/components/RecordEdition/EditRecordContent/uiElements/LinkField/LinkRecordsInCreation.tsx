// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useState} from 'react';
import {FaList, FaPen, FaPlus, FaTrash} from 'react-icons/fa';
import {Explorer} from '_ui/components/Explorer';
import {ExplorerWrapper} from './shared/ExplorerWrapper';
import LinkActionsButtons from './shared/LinkActionsButtons';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useRecordSelector} from './action-primary/useRecordSelector';
import {useEditRecord} from './action-item/useEditRecord';
import {useUnselectRecord} from './action-item/useUnselectRecord';
import {IExplorerFilterStandard} from '_ui/components/Explorer/_types';
import {ACTION_ITEM_EMPTY_LABEL, NO_RECORD_FILTERS} from './shared/utils';
import {useCreateRecord} from './action-primary/useCreateRecord';
import {RecordFilterOperator} from '_ui/_gqlTypes';
import {useUnselectAllRecords} from './action-mass/useUnselectAllRecords';

interface ILinkRecordsInCreationProps {
    libraryId: string;
    isReadOnly: boolean;
    isMultipleValues: boolean;
}

const LinkRecordsInCreation: FunctionComponent<ILinkRecordsInCreationProps> = ({
    libraryId,
    isReadOnly,
    isMultipleValues
}) => {
    const {t} = useSharedTranslation();

    const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
    const [explorerFilters, setExplorerFilters] = useState<IExplorerFilterStandard[]>(NO_RECORD_FILTERS);
    const [explorerKey, setExplorerKey] = useState(0);

    const updateExplorerKey = () => setExplorerKey(explorerKey + 1);

    const {openModal: openCreateRecordModal, CreateRecordModal} = useCreateRecord({
        selectedRecordIds,
        setSelectedRecordIds,
        explorerFilters,
        setExplorerFilters,
        updateExplorerKey
    });

    const {openModal: openRecordSelectorModal, RecordSelectorModal} = useRecordSelector({
        libraryId,
        selectionMode: isMultipleValues ? 'multiple' : 'simple',
        selectedRecordIds,
        setSelectedRecordIds,
        explorerFilters,
        setExplorerFilters,
        updateExplorerKey
    });

    const {openModal: openEditRecordModal, EditRecordModal} = useEditRecord();

    const {callback: unselectRecordCallback} = useUnselectRecord({
        selectedRecordIds,
        setSelectedRecordIds,
        explorerFilters,
        setExplorerFilters,
        updateExplorerKey
    });

    const {callback: unselectAllRecordsCallback} = useUnselectAllRecords({
        selectedRecordIds,
        setSelectedRecordIds,
        explorerFilters,
        setExplorerFilters,
        updateExplorerKey
    });

    const hasNoSelectedRecord = selectedRecordIds.length === 0;

    return (
        <>
            <ExplorerWrapper>
                <Explorer
                    key={explorerKey}
                    defaultViewSettings={{
                        filters: explorerFilters,
                        filtersOperator: RecordFilterOperator.OR
                    }}
                    entrypoint={{
                        type: 'library',
                        libraryId
                    }}
                    showTitle={false}
                    showSearch={false}
                    selectionMode={isMultipleValues ? 'multiple' : 'simple'}
                    hideSelectAllAction={!isMultipleValues}
                    disableSelection={isReadOnly || !isMultipleValues}
                    defaultActionsForItem={[]}
                    itemActions={[
                        {label: ACTION_ITEM_EMPTY_LABEL, icon: <FaPen />, callback: openEditRecordModal},
                        {
                            label: ACTION_ITEM_EMPTY_LABEL,
                            icon: <FaTrash />,
                            callback: unselectRecordCallback,
                            isDanger: true
                        }
                    ]}
                    defaultMassActions={[]}
                    massActions={
                        isMultipleValues
                            ? [{icon: <FaTrash />, label: t('global.delete'), callback: unselectAllRecordsCallback}]
                            : []
                    }
                    hidePrimaryActions
                    hideTableHeader
                    iconsOnlyItemActions
                    noPagination
                />
            </ExplorerWrapper>
            <LinkActionsButtons
                createButtonProps={{
                    icon: <FaPlus />,
                    label: t('explorer.create-one'),
                    callback: () => openCreateRecordModal(libraryId),
                    disabled: isReadOnly
                }}
                linkButtonProps={{
                    icon: <FaList />,
                    label:
                        isMultipleValues || hasNoSelectedRecord
                            ? t('explorer.add-existing-item')
                            : t('record_edition.replace-by-existing-item'),
                    callback: openRecordSelectorModal,
                    disabled: isReadOnly
                }}
                hasNoValue={hasNoSelectedRecord}
            />
            {CreateRecordModal}
            {RecordSelectorModal}
            {EditRecordModal}
        </>
    );
};

export default LinkRecordsInCreation;
