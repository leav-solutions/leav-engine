// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {SaveViewModal} from './SaveViewModal';
import {KitButton} from 'aristid-ds';
import {FaSdCard} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {mapViewTypeFromExplorerToLegacy} from '../../_constants';
import {isExplorerFilterThrough} from '../../_types';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation';

export const useCreateNewView = () => {
    const {t} = useSharedTranslation();
    const {view, dispatch} = useViewSettingsContext();
    const {saveView} = useExecuteSaveViewMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const _toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const _mappingViewForCreation = (label: Record<string, string>) => ({
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

    const _createView = async (label: Record<string, string>) => {
        const mappedView = _mappingViewForCreation(label);

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
        createNewViewButton: (
            <>
                <SaveViewModal
                    isOpen={isModalOpen}
                    labels={view.viewLabels}
                    onSave={_createView}
                    onClose={_toggleModal}
                />
                <KitButton type="redirect" icon={<FaSdCard />} onClick={_toggleModal}>
                    {t('explorer.save-view-as')}
                </KitButton>
            </>
        )
    };
};
