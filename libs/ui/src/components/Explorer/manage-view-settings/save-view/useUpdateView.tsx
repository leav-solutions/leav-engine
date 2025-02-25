// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton} from 'aristid-ds';
import {FaSave} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation';
import {prepareViewForRequest} from './prepareViewForRequest';
import {IViewDisplay} from '_ui/types';
import {mapViewTypeFromExplorerToLegacy} from '../../_constants';
import {useTransformFilters} from '../_shared/useTransformFilters';

export const useUpdateView = () => {
    const {t} = useSharedTranslation();
    const {toValidFilters} = useTransformFilters();
    const {view, dispatch} = useViewSettingsContext();
    const {saveView} = useExecuteSaveViewMutation();

    const _updateView = async () => {
        const mappedView = {
            ...prepareViewForRequest(view, view.viewLabels),
            id: view.viewId
        };

        const {data} = await saveView({
            view: mappedView
        });

        if (data) {
            dispatch({
                type: ViewSettingsActionTypes.UPDATE_VIEWS,
                payload: {
                    id: data.saveView.id,
                    ownerId: data.saveView.created_by.id,
                    label: data.saveView.label,
                    shared: data.saveView.shared,
                    filters: toValidFilters(data.saveView.filters),
                    sort: data.saveView.sort ?? [],
                    display: (data.saveView.display as IViewDisplay) ?? {
                        type: mapViewTypeFromExplorerToLegacy[view.viewType]
                    },
                    attributes: data.saveView?.attributes?.map(({id}) => id) ?? []
                }
            });
        }
    };

    return {
        updateViewButton:
            !view.savedViews.length || !view.viewId ? null : (
                <KitButton type="redirect" icon={<FaSave />} onClick={_updateView}>
                    {t('global.save')}
                </KitButton>
            )
    };
};
