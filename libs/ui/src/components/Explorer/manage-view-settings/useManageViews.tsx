// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation';
import {isExplorerFilterThrough} from '../_types';
import {mapViewTypeFromExplorerToLegacy} from '../_constants';
import {useViewSettingsContext} from './store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from './store-view-settings/viewSettingsReducer';

export const useManageViews = () => {
    const {view, dispatch} = useViewSettingsContext();
    const {saveView} = useExecuteSaveViewMutation();

    const _handleSaveView = async (label: Record<string, string>) => {
        const res = await saveView({
            view: {
                id: view.viewId,
                library: view.libraryId,
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

        if (res.data) {
            dispatch({
                type: ViewSettingsActionTypes.UPDATE_VIEW_NAME,
                payload: res.data?.saveView.label
            });
        }
    };

    return {
        handleSaveView: _handleSaveView
    };
};
