import {KitButton} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import useExecuteUpdateViewMutation from '../../_queries/useExecuteUpdateViewMutation';
import {prepareViewForRequest} from './prepareViewForRequest';
import {type IViewDisplay} from '_ui/types';
import {mapViewTypeFromExplorerToLegacy} from '../../_constants';
import {useEffect, useRef, useState} from 'react';
import {useMeQuery} from '_ui/_gqlTypes';
import {type IUserView} from '../../_types';
import {useTransformFilters} from '_ui/components/Filters/useTransformFilters';
import {useFiltersContext} from '_ui/components/Filters/useFiltersContext';
import {FiltersActionTypes} from '_ui/components/Filters/context/filtersReducer';
import {type UIFilter} from '_ui/components/Filters/_types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSave} from '@fortawesome/free-solid-svg-icons';

export const useUpdateView = () => {
    const {t} = useSharedTranslation();
    const {toValidFilters} = useTransformFilters();
    const {view, dispatch} = useViewSettingsContext();
    const {filtersData, dispatch: filtersDispatch} = useFiltersContext();
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
            ...prepareViewForRequest(view, filtersData.filters, view.viewLabels),
            id: view.viewId,
            shared: currentView.current?.shared ?? false,
        };

        const {data} = await updateView({
            view: mappedView,
        });

        if (data) {
            const validFilters = toValidFilters(data.updateView.filters);
            dispatch({
                type: ViewSettingsActionTypes.UPDATE_VIEWS,
                payload: {
                    id: data.updateView.id,
                    ownerId: data.updateView.created_by?.id ?? null,
                    label: data.updateView.label,
                    shared: data.updateView.shared,
                    filters: validFilters,
                    sort: data.updateView.sort ?? [],
                    display: (data.updateView.display as IViewDisplay) ?? {
                        type: mapViewTypeFromExplorerToLegacy[view.viewType],
                    },
                    attributes: data.updateView?.attributes?.map(({id}) => id) ?? [],
                },
            });
            filtersDispatch({
                type: FiltersActionTypes.UPDATE_VIEWS,
                payload: {
                    ...filtersData,
                    viewId: data.updateView.id,
                    filters: data.updateView.filters as UIFilter[],
                },
            });
        }
    };

    return {
        updateViewButton:
            !view.viewId || !view.savedViews.length || !isOwnerView ? null : (
                <KitButton type="action" icon={<FontAwesomeIcon icon={faSave} />} onClick={_updateView}>
                    {t('global.save')}
                </KitButton>
            ),
    };
};
