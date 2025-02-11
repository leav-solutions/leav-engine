// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation';
import {isExplorerFilterThrough} from '../_types';
import {mapViewTypeFromExplorerToLegacy} from '../_constants';
import {useViewSettingsContext} from './store-view-settings/useViewSettingsContext';

/**
 * Hook used to manage the views : load save and reset
 *
 * @param libraryId - library Id
 */
export const useManageViews = (libraryId: string) => {
    const {view} = useViewSettingsContext();
    const {saveView} = useExecuteSaveViewMutation();

    const _handleSaveView = (label: Record<string, string>) => {
        saveView({
            view: {
                id: view.viewId,
                library: libraryId,
                shared: false,
                display: {
                    type: mapViewTypeFromExplorerToLegacy[view.viewType]
                },
                filters: view.filters.map(filter =>
                    isExplorerFilterThrough(filter)
                        ? {
                              field: `${filter.field}.${filter.subField}`,
                              value: filter.value,
                              condition: filter.subCondition
                          }
                        : {
                              field: filter.field,
                              value: filter.value,
                              condition: filter.condition
                          }
                ),
                sort: view.sort.map(({field: attributeId, order}) => ({field: attributeId, order})),
                attributes: view.attributesIds,
                label
            }
        });
    };

    return {
        handleSaveView: _handleSaveView
    };
};
