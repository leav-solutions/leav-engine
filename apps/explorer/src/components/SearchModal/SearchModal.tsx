// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import Modal from 'antd/lib/modal/Modal';
import LibraryItemsList from 'components/LibraryItemsList';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {getLibraryDetailExtendedQuery} from 'graphQL/queries/libraries/getLibraryDetailExtendQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {resetSearchSelection} from 'redux/selection';
import {useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {GET_LIBRARY_DETAIL_EXTENDED, GET_LIBRARY_DETAIL_EXTENDEDVariables} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
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

    const renderModal = (content: JSX.Element): JSX.Element => (
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
            {content}
        </Modal>
    );

    const {loading, data, error} = useQuery<GET_LIBRARY_DETAIL_EXTENDED, GET_LIBRARY_DETAIL_EXTENDEDVariables>(
        getLibraryDetailExtendedQuery,
        {
            variables: {
                libId
            }
        }
    );

    if (loading) {
        return renderModal(<Loading />);
    }

    if (error) {
        return renderModal(<ErrorDisplay message={error.message} />);
    }

    if (!data.libraries.list.length) {
        return renderModal(<ErrorDisplay message={t('lib_detail.not_found')} />);
    }

    return renderModal(
        <WrapperItemsList>
            <LibraryItemsList selectionMode={true} library={data.libraries.list[0]} />
        </WrapperItemsList>
    );
}

export default SearchModal;
