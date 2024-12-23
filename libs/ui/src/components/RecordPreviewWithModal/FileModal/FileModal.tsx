// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import useGetPreparedFileData from '../../../hooks/useGetPreparedFileData/useGetPreparedFileData';
import {ErrorDisplay} from '../../ErrorDisplay';
import {Loading} from '../../Loading';
import FileModalContent from './FileModalContent';
import {fileModalWidth} from './_constants';

const StyledModal = styled(Modal)`
    .ant-modal-close {
        top: 0;
        right: 0;
        width: 4rem;
        height: 4rem;
        line-height: 4rem;
    }

    && .ant-modal-content {
        padding: 0;
    }
`;

const ModalFooter = styled.div`
    padding: 0.5rem 1rem;
`;

interface IFileModalProps {
    fileId: string;
    libraryId: string;
    open: boolean;
    onClose: () => void;
}

function FileModal({fileId, libraryId, open, onClose}: IFileModalProps): JSX.Element {
    const {t} = useSharedTranslation();

    const {loading, error, fileData} = useGetPreparedFileData(libraryId, fileId);
    const footerButtons = [
        <Button aria-label={t('global.close')} key="close" onClick={onClose}>
            {t('global.close')}
        </Button>
    ];

    const footer = <ModalFooter>{footerButtons}</ModalFooter>;

    return (
        <StyledModal
            open={open}
            destroyOnClose
            okText={t('global.close')}
            onCancel={onClose}
            width="90vw"
            centered
            style={{padding: 0, maxWidth: `${fileModalWidth}px`}}
            styles={{body: {height: 'calc(100vh - 12rem)', overflowY: 'auto', padding: 0}}}
            footer={footer}
        >
            {loading && <Loading />}
            {!loading && (error || !fileData) && (
                <ErrorDisplay message={error?.message ?? t('global.element_not_found')} />
            )}
            {!loading && !error && fileData && <FileModalContent fileData={fileData} />}
        </StyledModal>
    );
}

export default FileModal;
