// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {SaveViewModal} from './SaveViewModal';
import {KitButton} from 'aristid-ds';
import {FaSave, FaSdCard} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useManageViews} from '../useManageViews';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';

export const useSaveView = () => {
    const {t} = useSharedTranslation();
    const {prepareSaveView} = useManageViews();
    const {view} = useViewSettingsContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const _toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };
    return {
        saveViewButton: (
            <>
                <SaveViewModal isOpen={isModalOpen} onClose={_toggleModal} />
                <KitButton type="redirect" icon={<FaSave />} onClick={() => prepareSaveView(view.viewLabels, false)}>
                    {t('global.save')}
                </KitButton>
                <KitButton type="redirect" icon={<FaSdCard />} onClick={_toggleModal}>
                    {t('explorer.save-view-as')}
                </KitButton>
            </>
        )
    };
};
