// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation';
import {isExplorerFilterThrough} from '../_types';
import {mapViewTypeFromExplorerToLegacy} from '../_constants';
import {useViewSettingsContext} from './store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from './store-view-settings/viewSettingsReducer';
import {ViewInput, ViewSizes, ViewTypes} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

export const useManageViews = () => {
    const {view, dispatch} = useViewSettingsContext();
    const {saveView} = useExecuteSaveViewMutation();
    const {defaultLang} = useLang();
    const {t} = useSharedTranslation();

    const _handleSaveView = async (label: Record<string, string>, saveAs: boolean = false) => {
        const newView: ViewInput = {
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
        };

        if (!saveAs) {
            newView.id = view.viewId;
        }

        const newViewRes = await saveView({
            view: newView
        });

        if (newViewRes.data) {
            dispatch({
                type: ViewSettingsActionTypes.UPDATE_VIEWS,
                payload: {
                    id: newViewRes.data.saveView.id,
                    label: newViewRes.data.saveView.label,
                    shared: newViewRes.data.saveView.shared
                }
            });
        }
    };

    return {
        handleSaveView: _handleSaveView
    };
};
