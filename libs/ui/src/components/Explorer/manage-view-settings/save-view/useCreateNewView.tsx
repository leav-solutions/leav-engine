// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {SaveViewModal} from './SaveViewModal';
import {KitButton} from 'aristid-ds';
import {FaSdCard} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation';
import {prepareViewForRequest} from './prepareViewForRequest';

export const useCreateNewView = () => {
    const {t} = useSharedTranslation();
    const {view, dispatch} = useViewSettingsContext();
    const {saveView} = useExecuteSaveViewMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const _toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const _createView = async (label: Record<string, string>) => {
        const mappedView = prepareViewForRequest(view, label);

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
