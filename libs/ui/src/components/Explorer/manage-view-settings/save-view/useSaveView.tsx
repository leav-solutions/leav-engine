// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {SaveViewModal} from './SaveViewModal';
import {KitButton} from 'aristid-ds';
import {FaSave} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

export const useSaveView = () => {
    const {t} = useSharedTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const _toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return {
        saveViewButton: (
            <>
                <SaveViewModal isOpen={isModalOpen} onClose={_toggleModal} />
                <KitButton type="redirect" icon={<FaSave />} onClick={_toggleModal}>
                    {t('explorer.save-view')}
                </KitButton>
            </>
        )
    };
};
