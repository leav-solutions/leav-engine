// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton} from 'aristid-ds';
import {FaShare} from 'react-icons/fa';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {useEffect, useState} from 'react';
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import {prepareViewForRequest} from './prepareViewForRequest';
import {IViewDisplay} from '_ui/types';
import {mapViewTypeFromExplorerToLegacy} from '../../_constants';
import {useTransformFilters} from '../_shared/useTransformFilters';
import {useMeQuery} from '_ui/_gqlTypes';

export const useShareView = () => {
    const {t} = useSharedTranslation();
    const {view, dispatch} = useViewSettingsContext();
    const {saveView} = useExecuteSaveViewMutation();
    const {toValidFilters} = useTransformFilters();
    const [isSharedView, setIsSharedView] = useState<boolean>(false);
    const [isOwnerView, setIsOwnerView] = useState<boolean>(false);

    const {data: userData} = useMeQuery();

    useEffect(() => {
        setIsSharedView(view.savedViews.find(v => v.id === view.viewId)?.shared ?? false);
        setIsOwnerView(view.savedViews.find(v => v.id === view.viewId)?.ownerId === userData?.me?.whoAmI?.id);
    }, [view.viewId]);

    const _toggleShareView = async () => {
        const mappedView = {
            ...prepareViewForRequest(view, view.viewLabels),
            shared: !isSharedView,
            id: view.viewId
        };

        const {data} = await saveView({
            view: mappedView
        });

        setIsSharedView(!isSharedView);
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
        shareViewButton: (
            <>
                {!isSharedView && view.viewId ? (
                    <KitButton type="redirect" icon={<FaShare />} onClick={_toggleShareView}>
                        {t('explorer.share-view')}
                    </KitButton>
                ) : isOwnerView ? (
                    <KitButton type="redirect" icon={<FaShare />} onClick={_toggleShareView}>
                        {t('explorer.unshare-view')}
                    </KitButton>
                ) : null}
            </>
        )
    };
};
