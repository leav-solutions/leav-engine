// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitModal} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IExplorerFilterStandard, IItemData} from '_ui/components/Explorer/_types';

interface IUnselectRecordProps {
    selectedRecordIds: string[];
    setSelectedRecordIds: (selectedRecordIds: string[]) => void;
    explorerFilters: IExplorerFilterStandard[];
    setExplorerFilters: (filters: IExplorerFilterStandard[]) => void;
    updateExplorerKey: () => void;
}

export const useUnselectRecord = ({
    selectedRecordIds,
    setSelectedRecordIds,
    explorerFilters,
    setExplorerFilters,
    updateExplorerKey
}: IUnselectRecordProps) => {
    const {t} = useSharedTranslation();

    return {
        callback: (item: IItemData) => {
            KitModal.confirm({
                type: 'confirm',
                dangerConfirm: true,
                content: t('record_edition.delete_link_confirm'),
                okText: t('global.submit') ?? undefined,
                cancelText: t('global.cancel') ?? undefined,
                onOk: async () => {
                    const newSelectedRecordIds = selectedRecordIds.filter(id => id !== item.itemId);
                    setSelectedRecordIds(newSelectedRecordIds);

                    const newExplorerFilters = explorerFilters.filter(filter => filter.value !== item.itemId);
                    setExplorerFilters(newExplorerFilters);

                    updateExplorerKey();
                }
            });
        }
    };
};
