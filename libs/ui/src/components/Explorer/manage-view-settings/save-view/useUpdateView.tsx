// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton} from 'aristid-ds';
import {FaSave} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import useExecuteUpdateViewMutation from '../../_queries/useExecuteUpdateViewMutation';
import {prepareViewForRequest} from './prepareViewForRequest';
import {IViewDisplay} from '_ui/types';
import {mapViewTypeFromExplorerToLegacy} from '../../_constants';
import {useTransformFilters} from '../_shared/useTransformFilters';
import {useEffect, useRef, useState} from 'react';
import {useMeQuery} from '_ui/_gqlTypes';
import {IUserView} from '../../_types';

export const useUpdateView = () => {
    const {t} = useSharedTranslation();
    const {toValidFilters} = useTransformFilters();
    const {view, dispatch} = useViewSettingsContext();
    const {updateView} = useExecuteUpdateViewMutation();
    const [isOwnerView, setIsOwnerView] = useState(false);
    const currentView = useRef<IUserView | undefined>();

    const {data: userData} = useMeQuery();

    useEffect(() => {
        currentView.current = view.savedViews.find(v => v.id === view.viewId);
        if (currentView.current === undefined) {
            return;
        }
        setIsOwnerView(currentView.current.ownerId === userData?.me?.whoAmI?.id);
    }, [view.viewId]);

    const _updateView = async () => {
        if (!view.viewId) {
            return;
        }
        const mappedView = {
            ...prepareViewForRequest(view, view.viewLabels),
            id: view.viewId,
            shared: currentView.current?.shared ?? false
        };

        const {data} = await updateView({
            view: mappedView
        });

        if (data) {
            dispatch({
                type: ViewSettingsActionTypes.UPDATE_VIEWS,
                payload: {
                    id: data.updateView.id,
                    ownerId: data.updateView.created_by.id,
                    label: data.updateView.label,
                    shared: data.updateView.shared,
                    filters: toValidFilters(data.updateView.filters),
                    sort: data.updateView.sort ?? [],
                    display: (data.updateView.display as IViewDisplay) ?? {
                        type: mapViewTypeFromExplorerToLegacy[view.viewType]
                    },
                    attributes: data.updateView?.attributes?.map(({id}) => id) ?? []
                }
            });
        }
    };

    return {
        updateViewButton:
            !view.viewId || !view.savedViews.length || !isOwnerView ? null : (
                <KitButton type="action" icon={<FaSave />} onClick={_updateView}>
                    {t('global.save')}
                </KitButton>
            )
    };
};
