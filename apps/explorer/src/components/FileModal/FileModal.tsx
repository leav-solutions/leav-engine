// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {Button, Modal} from 'antd';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {getFileDataQuery, IFileDataQuery, IFileDataQueryVariables} from 'graphQL/queries/records/getFileDataQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import FileModalContent from './FileModalContent';
import {fileModalWidth} from './_constants';

interface IFileModalProps {
    fileId: string;
    libraryId: string;
    open: boolean;
    onClose: () => void;
}

function FileModal({fileId, libraryId, open, onClose}: IFileModalProps): JSX.Element {
    const {t} = useTranslation();

    const {loading, error, data} = useQuery<IFileDataQuery, IFileDataQueryVariables>(getFileDataQuery(libraryId), {
        variables: {fileId}
    });

    const footerButtons = [
        <Button aria-label={t('global.close')} key="close" onClick={onClose}>
            {t('global.close')}
        </Button>
    ];

    const fileData = data?.[libraryId].list?.[0];

    return (
        <Modal
            visible={open}
            destroyOnClose
            okText={t('global.close')}
            onCancel={onClose}
            width="90vw"
            centered
            style={{padding: 0, maxWidth: `${fileModalWidth}px`}}
            bodyStyle={{height: 'calc(100vh - 12rem)', overflowY: 'auto', padding: 0}}
            footer={footerButtons}
        >
            {loading && <Loading />}
            {!loading && (error || !fileData) && (
                <ErrorDisplay message={error?.message ?? t('global.element_not_found')} />
            )}
            {!loading && !error && fileData && <FileModalContent fileData={fileData} />}
        </Modal>
    );
}

export default FileModal;
