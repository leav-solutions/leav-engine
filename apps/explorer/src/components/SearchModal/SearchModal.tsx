// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Modal from 'antd/lib/modal/Modal';
import LibraryItemsList from 'components/LibraryItemsList';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {resetSearchSelection} from 'redux/selection';
import {useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {ISharedStateSelectionSearch} from '_types/types';

const WrapperItemsList = styled.div`
    position: relative;
    height: 95%;
`;

interface ISearchModalProps {
    libId: string;
    visible: boolean;
    setVisible: (visible: boolean) => void;
    submitAction: (selection: ISharedStateSelectionSearch) => void;
}

function SearchModal({visible, setVisible, submitAction, libId}: ISearchModalProps): JSX.Element {
    const {t} = useTranslation();
    const {selectionState} = useAppSelector(state => ({selectionState: state.selection}));
    const dispatch = useDispatch();

    const handleModalClose = () => {
        dispatch(resetSearchSelection());
        setVisible(false);
    };

    const handleOk = () => {
        submitAction(selectionState.searchSelection);
        handleModalClose();
    };

    return (
        <Modal
            visible={visible}
            onCancel={handleModalClose}
            width="95vw"
            bodyStyle={{height: '90vh', overflow: 'hidden'}}
            style={{
                top: '1rem'
            }}
            closable={false}
            onOk={handleOk}
            okText={t('global.apply')}
            cancelText={t('global.cancel')}
        >
            <WrapperItemsList>
                <LibraryItemsList selectionMode={true} libId={libId} />
            </WrapperItemsList>
        </Modal>
    );
}

export default SearchModal;
