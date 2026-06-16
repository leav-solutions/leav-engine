import {useState} from 'react';
import {LabelViewFormModal} from './LabelViewFormModal';
import {KitButton} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation';
import {prepareViewForRequest} from './prepareViewForRequest';
import {mapViewTypeFromExplorerToLegacy} from '../../_constants';
import {type IViewDisplay} from '_ui/types';
import {useTransformFilters} from '_ui/components/Filters/useTransformFilters';
import {useFiltersContext} from '_ui/components/Filters/useFiltersContext';
import {FiltersActionTypes} from '_ui/components/Filters/context/filtersReducer';
import {type UIFilter} from '_ui/components/Filters/_types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSdCard} from '@fortawesome/free-solid-svg-icons';

export const useCreateNewView = () => {
    const {t} = useSharedTranslation();
    const {toValidFilters} = useTransformFilters();
    const {view, dispatch} = useViewSettingsContext();
    const {filtersData, dispatch: filtersDispatch} = useFiltersContext();
    const {saveView} = useExecuteSaveViewMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const _toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const _createView = async (label: Record<string, string>) => {
        const mappedView = prepareViewForRequest(view, filtersData.filters, label);

        const {data} = await saveView({
            view: mappedView,
        });

        if (data) {
            const validFilters = toValidFilters(data.saveView.filters);
            dispatch({
                type: ViewSettingsActionTypes.UPDATE_VIEWS,
                payload: {
                    id: data.saveView.id,
                    ownerId: data.saveView.created_by.id,
                    label: data.saveView.label,
                    shared: data.saveView.shared,
                    filters: validFilters,
                    sort: data.saveView.sort ?? [],
                    display: (data.saveView.display as IViewDisplay) ?? {
                        type: mapViewTypeFromExplorerToLegacy[view.viewType],
                    },
                    attributes: data.saveView?.attributes?.map(({id}) => id) ?? [],
                },
            });
            filtersDispatch({
                type: FiltersActionTypes.UPDATE_VIEWS,
                payload: {
                    ...filtersData,
                    viewId: data.saveView.id,
                    filters: validFilters as UIFilter[],
                },
            });
        }
    };

    return {
        createNewViewButton: (
            <>
                <LabelViewFormModal isOpen={isModalOpen} onSubmit={_createView} onClose={_toggleModal} />
                <KitButton type="action" icon={<FontAwesomeIcon icon={faSdCard} />} onClick={_toggleModal}>
                    {t('explorer.viewList.save-view-as')}
                </KitButton>
            </>
        ),
    };
};
