// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InboxOutlined, LoadingOutlined, FileOutlined, CheckCircleTwoTone} from '@ant-design/icons';
import {Upload, Modal, Button, Space, Progress, Spin} from 'antd';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import SelectTreeNodeModal from '../shared/SelectTreeNodeModal/SelectTreeNodeModal';
import {useLazyQuery, useQuery, useSubscription, useMutation} from '@apollo/client';
import {getGraphqlQueryNameFromLibraryName} from '@leav/utils';
import {getFileDataQuery, IFileDataQuery, IFileDataQueryVariables} from 'graphQL/queries/records/getFileDataQuery';
import {
    getDirectoryDataQuery,
    IDirectoryDataQuery,
    IDirectoryDataQueryVariables
} from 'graphQL/queries/records/getDirectoryDataQuery';
import {RiNodeTree} from 'react-icons/ri';
import {getUploadUpdates} from 'graphQL/subscribes/upload/getUploadUpdates';
import {ME} from '../../_gqlTypes/ME';
import {getMe} from '../../graphQL/queries/userData/me';
import {UPLOAD, UPLOADVariables} from '_gqlTypes/UPLOAD';
import {uploadMutation} from '../../graphQL/mutations/upload/uploadMutation';
import {ITreeNode} from '../../_types/types';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IUploadFilesProps {
    libraryId: string;
    multiple: boolean;
    onClose: () => void;
}

function UploadFiles({libraryId, multiple, onClose}: IUploadFilesProps): JSX.Element {
    const {t} = useTranslation();
    const [showSelectTreeNodeModal, setShowSelectTreeNodeModal] = useState(false);
    const [selectedNode, setSelectedNode] = useState<ITreeNode>();
    const [files, setFiles] = useState<any[]>([]);
    const {data: userData, loading: meLoading, error: meError} = useQuery<ME>(getMe);

    const props = {
        name: 'files',
        multiple,
        maxCount: multiple ? 99999 : 1,
        showUploadList: true,
        fileList: files,
        disabled: files.some(f => typeof f.status !== 'undefined'),
        beforeUpload: (_, newFiles) => {
            const newFileList = [...files, ...newFiles];
            setFiles(newFileList);
            return true;
        },
        onRemove: file => {
            const newFileList = files.filter(f => f.uid !== file.uid);
            setFiles(newFileList);
        },
        iconRender: (file, _) => {
            if (file.status === 'uploading') {
                return <LoadingOutlined />;
            } else if (file.status === 'success') {
                return <CheckCircleTwoTone twoToneColor="#52c41a" />;
            }

            return <FileOutlined />;
        },
        progress: {showInfo: true, strokeWidth: 2}
    };

    const [runUpload, {error}] = useMutation<UPLOAD, UPLOADVariables>(uploadMutation, {
        fetchPolicy: 'no-cache',
        onCompleted: () => {
            console.debug('Upload completed');
        }
    });

    // Sub to update files upload progress
    useSubscription(getUploadUpdates, {
        variables: {filters: {userId: userData?.me?.id}},
        skip: !userData?.me?.id,
        onSubscriptionData: subData => {
            const uploadData = subData.subscriptionData.data.upload;
            const newUploadFileList = [...files];

            const fileIndexToUpdate = newUploadFileList.findIndex(f => f.uid === uploadData.uid);

            if (fileIndexToUpdate !== -1) {
                newUploadFileList[fileIndexToUpdate].percent = uploadData.progress.percentage;
                newUploadFileList[fileIndexToUpdate].status =
                    uploadData.progress.percentage === 100 ? 'success' : 'uploading';
            }

            setFiles(newUploadFileList);
        }
    });

    const startUpload = async () => {
        await runUpload({
            variables: {
                library: libraryId,
                nodeId: selectedNode.id,
                files: files.map(f => ({
                    data: f,
                    uid: f.uid,
                    size: f.size
                }))
            }
        });
    };

    const _onClose = () => {
        setFiles([]);
        onClose();
    };

    const libraryTree = `${libraryId}_tree`;

    return (
        <>
            {showSelectTreeNodeModal && (
                <SelectTreeNodeModal
                    selectedNodeKey={selectedNode?.key}
                    tree={{id: libraryTree}}
                    onSubmit={node => setSelectedNode(node)}
                    onClose={() => setShowSelectTreeNodeModal(false)}
                    visible={showSelectTreeNodeModal}
                    canSelectRoot
                />
            )}
            <Modal
                title="Upload files"
                visible={true}
                closable={false}
                footer={
                    <Space direction="horizontal">
                        <Button aria-label={t('global.close')} key="close" onClick={_onClose}>
                            {t('global.close')}
                        </Button>
                        {(!files.length ||
                            !files.every(f => typeof f.status !== 'undefined' && f.status !== 'uploading')) && (
                            <Button
                                loading={files.some(f => f.status === 'uploading')}
                                disabled={!files.length}
                                className="submit-btn"
                                title={'Upload'}
                                type="primary"
                                onClick={startUpload}
                            >
                                {'Upload'}
                            </Button>
                        )}
                    </Space>
                }
            >
                <Space direction="vertical" align="center" style={{display: 'flex'}}>
                    <Button placeholder="Select path" onClick={() => setShowSelectTreeNodeModal(true)}>
                        {selectedNode?.title || 'Select path'}
                    </Button>

                    {!!selectedNode && (
                        <Upload.Dragger {...props}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        </Upload.Dragger>
                    )}
                </Space>
            </Modal>
        </>
    );
}

export default UploadFiles;
