// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal} from 'antd';
import {FunctionComponent, useState} from 'react';
import {LibraryItemsList} from '_ui/components/LibraryItemsList';
import {ErrorDisplayTypes} from '_ui/constants';
import useGetLibraryDetailExtendedQuery from '_ui/hooks/useGetLibraryDetailExtendedQuery/useGetLibraryDetailExtendedQuery';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ISearchSelection} from '_ui/types';
import {ErrorDisplay} from '../ErrorDisplay';
import {Loading} from '../Loading';

interface ISearchModalProps {
    libId: string;
    visible: boolean;
    setVisible: (visible: boolean) => void;
    submitAction: (selection: ISearchSelection) => void;
}

export const SearchModal: FunctionComponent<ISearchModalProps> = ({visible, setVisible, submitAction, libId}) => {
    const {t} = useSharedTranslation();
    const [selection, setSelection] = useState<ISearchSelection>({selected: [], allSelected: false});

    const _handleModalClose = () => {
        setVisible(false);
    };

    const _handleOk = () => {
        submitAction(selection);
        _handleModalClose();
    };

    const _handleSelectionChange = (newSelection: ISearchSelection) => {
        setSelection(newSelection);
    };

    const renderModal = (content: JSX.Element): JSX.Element => (
        <Modal
            open={visible}
            onCancel={_handleModalClose}
            width="95vw"
            bodyStyle={{height: '90vh', overflow: 'hidden'}}
            style={{
                top: '1rem'
            }}
            onOk={_handleOk}
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
        <div style={{position: 'relative'}}>
            <LibraryItemsList
                selectionMode={true}
                library={data.libraries.list[0]}
                style={{height: 'calc(100vh - 11rem)'}}
                onSelectChange={_handleSelectionChange}
            />
        </div>
    );
};

export default SearchModal;
