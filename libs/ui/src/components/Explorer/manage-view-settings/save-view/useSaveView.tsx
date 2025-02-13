// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {SaveViewModal} from './SaveViewModal';

export const useSaveView = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const _toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return {
        saveViewModal: <SaveViewModal isOpen={isModalOpen} onClose={_toggleModal} />,
        toggleModal: _toggleModal
    };
};
