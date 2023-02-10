// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal} from 'antd';
import LibraryItemsList from 'components/LibraryItemsList';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {ErrorDisplayTypes} from 'components/shared/ErrorDisplay/ErrorDisplay';
import Loading from 'components/shared/Loading';
import useGetLibraryDetailExtendedQuery from 'hooks/useGetLibraryDetailExtendedQuery/useGetLibraryDetailExtendedQuery';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {resetSearchSelection} from 'reduxStore/selection';
import {useAppSelector} from 'reduxStore/store';
import styled from 'styled-components';
import {ISharedStateSelectionSearch} from '_types/types';

const WrapperItemsList = styled.div`
    position: relative;
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
            open={visible}
            onCancel={handleModalClose}
            width="95vw"
            bodyStyle={{height: '90vh', overflow: 'hidden'}}
            style={{
                top: '1rem'
            }}
            onOk={handleOk}
            okText={t('global.apply')}
            cancelText={t('global.cancel')}
        >
            {content}
        </Modal>
    );

    const {loading, data, error} = useGetLibraryDetailExtendedQuery({library: libId});

    if (loading) {
        return renderModal(<Loading />);
    }

    if (error) {
        return renderModal(<ErrorDisplay message={error.message} />);
    }

    if (!data?.libraries?.list?.length) {
        return renderModal(<ErrorDisplay message={t('lib_detail.not_found', {libraryId: libId})} />);
    }

    if (!data.libraries.list[0].permissions.access_library) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />;
    }

    return renderModal(
        <WrapperItemsList>
            <LibraryItemsList
                selectionMode={true}
                library={data.libraries.list[0]}
                style={{height: 'calc(100vh - 11rem)'}}
            />
        </WrapperItemsList>
    );
}

export default SearchModal;
