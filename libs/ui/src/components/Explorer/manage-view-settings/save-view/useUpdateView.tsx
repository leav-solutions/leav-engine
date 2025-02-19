// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton} from 'aristid-ds';
import {FaSave} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {ViewInput} from '_ui/_gqlTypes';
import {mapViewTypeFromExplorerToLegacy} from '../../_constants';
import {isExplorerFilterThrough} from '../../_types';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation';

export const useUpdateView = () => {
    const {t} = useSharedTranslation();
    const {view, dispatch} = useViewSettingsContext();
    const {saveView} = useExecuteSaveViewMutation();

    const _mappingViewForUpdate = (label: Record<string, string>): ViewInput => ({
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
        sort: view.sort.map(({field, order}) => ({field, order})),
        attributes: view.attributesIds,
        label
    });

    const _updateView = async () => {
        const mappedView = _mappingViewForUpdate(view.viewLabels);

        const {data} = await saveView({
            view: mappedView
        });

        if (data) {
            dispatch({
                type: ViewSettingsActionTypes.UPDATE_VIEWS,
                payload: {
                    id: data.saveView.id,
                    label: data.saveView.label,
                    shared: data.saveView.shared
                }
            });
        }
    };

    return {
        updateViewButton: (
            <>
                <KitButton type="redirect" icon={<FaSave />} onClick={_updateView}>
                    {t('global.save')}
                </KitButton>
            </>
        )
    };
};
