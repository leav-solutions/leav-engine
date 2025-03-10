// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitModal} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IExplorerFilterStandard, MassSelection} from '_ui/components/Explorer/_types';
import {RecordFilterInput} from '_ui/_gqlTypes';

interface IUnselectAllRecordsProps {
    selectedRecordIds: string[];
    setSelectedRecordIds: (selectedRecordIds: string[]) => void;
    explorerFilters: IExplorerFilterStandard[];
    setExplorerFilters: (filters: IExplorerFilterStandard[]) => void;
    updateExplorerKey: () => void;
}

export const useUnselectAllRecords = ({
    selectedRecordIds,
    setSelectedRecordIds,
    explorerFilters,
    setExplorerFilters,
    updateExplorerKey
}: IUnselectAllRecordsProps) => {
    const {t} = useSharedTranslation();

    return {
        callback: (massSelectionFilter: RecordFilterInput[], _massSelection: MassSelection) => {
            KitModal.confirm({
                type: 'confirm',
                dangerConfirm: true,
                content: t('record_edition.delete_links_confirm'),
                okText: t('global.submit') ?? undefined,
                cancelText: t('global.cancel') ?? undefined,
                onOk: async () => {
                    const newSelectedRecordIds = selectedRecordIds.filter(
                        id => !massSelectionFilter.some(filter => filter.value === id)
                    );
                    setSelectedRecordIds(newSelectedRecordIds);

                    const newExplorerFilters = explorerFilters.filter(
                        filter => !massSelectionFilter.some(massFilter => massFilter.value === filter.value)
                    );
                    setExplorerFilters(newExplorerFilters);

                    updateExplorerKey();
                }
            });
        }
    };
};
