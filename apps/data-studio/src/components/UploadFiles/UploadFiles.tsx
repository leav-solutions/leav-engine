// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InboxOutlined, LoadingOutlined, FileOutlined, CheckCircleTwoTone} from '@ant-design/icons';
import {Upload, Modal, Button, Space, Steps, theme, StepProps} from 'antd';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import SelectTreeNodeModal from '../shared/SelectTreeNodeModal/SelectTreeNodeModal';
import {useQuery, useSubscription, useMutation} from '@apollo/client';
import {getUploadUpdates} from 'graphQL/subscribes/upload/getUploadUpdates';
import {ME} from '../../_gqlTypes/ME';
import {getMe} from '../../graphQL/queries/userData/me';
import {UPLOAD, UPLOADVariables} from '_gqlTypes/UPLOAD';
import {uploadMutation} from '../../graphQL/mutations/upload/uploadMutation';
import {ITreeNode} from '../../_types/types';
import SelectTreeNode from '../shared/SelectTreeNode';

interface IUploadFilesProps {
    libraryId: string;
    multiple: boolean;
    onClose: () => void;
}

function UploadFiles({libraryId, multiple, onClose}: IUploadFilesProps): JSX.Element {
    const {t} = useTranslation();
    const {token} = theme.useToken();
    const [selectedNode, setSelectedNode] = useState<ITreeNode>();
    const [files, setFiles] = useState<any[]>([]);
    const {data: userData, loading: meLoading, error: meError} = useQuery<ME>(getMe);
    const [status, setStatus] = useState<StepProps['status']>('wait');
    const [currentStep, setCurrentStep] = useState(0);

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

    const [runUpload, {loading, error}] = useMutation<UPLOAD, UPLOADVariables>(uploadMutation, {
        fetchPolicy: 'no-cache',
        onCompleted: () => {
            setStatus('finish');
        },
        onError: err => {
            setStatus('error');

            console.debug('error', JSON.stringify(err));
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

    const contentStyle: React.CSSProperties = {
        lineHeight: '260px',
        textAlign: 'center',
        marginTop: 16
    };

    const next = () => {
        setCurrentStep(currentStep + 1);
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    const onSelectPath = (node: ITreeNode, selected: boolean) => {
        setSelectedNode(!selected ? undefined : node);
    };

    const dragger = (
        <Upload.Dragger {...props}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">{t('upload.dragger_content')}</p>
        </Upload.Dragger>
    );

    const isDone = !!files.length && files.every(f => typeof f.status !== 'undefined' && f.status !== 'uploading');

    const libraryTree = `${libraryId}_tree`;

    const steps = [
        {
            title: t('upload.select_path_step_title'),
            content: (
                <div
                    style={{
                        borderRadius: token.borderRadiusLG,
                        border: `1px dashed ${token.colorBorder}`
                    }}
                >
                    <SelectTreeNode
                        tree={{id: libraryTree}}
                        onSelect={onSelectPath}
                        selectedNode={selectedNode?.key}
                        canSelectRoot
                    />
                </div>
            )
        },
        {
            title: t('upload.select_files_step_title'),
            content: dragger
        },
        {
            title: t('upload.upload_step_title'),
            content: dragger,
            icon: loading ? <LoadingOutlined /> : null
        }
    ];

    const items = steps.map(item => ({key: item.title, title: item.title, icon: item.icon}));

    return (
        <>
            <Modal
                title={t('upload.title')}
                open
                width="70rem"
                onCancel={_onClose}
                footer={
                    <>
                        {currentStep > 0 && currentStep < steps.length - 1 && (
                            <Button onClick={() => prev()}>{t('upload.previous')}</Button>
                        )}
                        {currentStep < steps.length - 2 && (
                            <Button type="primary" onClick={() => next()}>
                                {t('upload.next')}
                            </Button>
                        )}
                        {(!files.length || !isDone) && currentStep === steps.length - 2 && (
                            <Button
                                loading={loading}
                                disabled={!files.length}
                                className="submit-btn"
                                title={'Upload'}
                                type="primary"
                                onClick={() => {
                                    next();
                                    startUpload();
                                }}
                            >
                                {'Upload'}
                            </Button>
                        )}
                        {isDone && <Button onClick={_onClose}>{t('global.close')}</Button>}
                    </>
                }
            >
                <Steps status={status} current={currentStep} items={items} />
                <div style={contentStyle}>{steps[currentStep].content}</div>
            </Modal>
        </>
    );
}

export default UploadFiles;
