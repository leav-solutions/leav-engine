// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InboxOutlined, LoadingOutlined, FileOutlined, CheckCircleTwoTone} from '@ant-design/icons';
import {Upload, Modal, Button, Space, Steps, theme, StepProps, Alert, Divider} from 'antd';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import SelectTreeNodeModal from '../shared/SelectTreeNodeModal/SelectTreeNodeModal';
import {useQuery, useSubscription, useMutation, useLazyQuery} from '@apollo/client';
import {getUploadUpdates} from 'graphQL/subscribes/upload/getUploadUpdates';
import {ME} from '../../_gqlTypes/ME';
import {getMe} from '../../graphQL/queries/userData/me';
import {UPLOAD, UPLOADVariables, UPLOAD_upload} from '_gqlTypes/UPLOAD';
import {uploadMutation} from '../../graphQL/mutations/upload/uploadMutation';
import {ITreeNode, ITreeNodeWithRecord} from '../../_types/types';
import SelectTreeNode from '../shared/SelectTreeNode';
import {getTreeLibraries} from 'graphQL/queries/trees/getTreeLibraries';
import {GET_TREE_LIBRARIES, GET_TREE_LIBRARIESVariables} from '_gqlTypes/GET_TREE_LIBRARIES';
import {LibraryBehavior, TreeBehavior} from '_gqlTypes/globalTypes';
import {IS_FILE_EXISTS_AS_CHILD, IS_FILE_EXISTS_AS_CHILDVariables} from '_gqlTypes/IS_FILE_EXISTS_AS_CHILD';
import {isFileExistsAsChild} from 'graphQL/queries/records/isFileExistsAsChild';

const {confirm} = Modal;

interface IUploadFilesProps {
    defaultSelectedKey?: string;
    libraryId: string;
    multiple?: boolean;
    onClose: () => void;
    onCompleted?: (data: UPLOAD) => void;
}

function UploadFiles({
    defaultSelectedKey,
    libraryId,
    multiple = false,
    onCompleted,
    onClose
}: IUploadFilesProps): JSX.Element {
    const {t} = useTranslation();
    const {token} = theme.useToken();
    const [selectedNode, setSelectedNode] = useState<ITreeNodeWithRecord>();
    const [files, setFiles] = useState<any[]>([]);
    const {data: userData, loading: meLoading, error: meError} = useQuery<ME>(getMe);
    const [status, setStatus] = useState<StepProps['status']>('wait');
    const [currentStep, setCurrentStep] = useState(!!defaultSelectedKey ? 1 : 0);
    const [filesTreeId, setFilesTreeId] = useState<string>();
    const [directoriesLibraryId, setdirectoriesLibraryId] = useState<string>();
    const [errorMsg, setErrorMsg] = useState<string>();

    const props = {
        name: 'files',
        multiple,
        maxCount: multiple ? 99999 : 1,
        showUploadList: true,
        fileList: files,
        disabled: files.some(f => typeof f.status !== 'undefined'),
        onDrop: async data => {
            const newFiles = await _checkFilesExist(selectedNode?.id, data.dataTransfer.files);
            setFiles([...files, ...newFiles]);
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

    const [runIsFileExistsAsChild] = useLazyQuery<IS_FILE_EXISTS_AS_CHILD, IS_FILE_EXISTS_AS_CHILDVariables>(
        isFileExistsAsChild,
        {
            fetchPolicy: 'no-cache'
        }
    );

    const _checkFilesExist = async (parentNode: string, filesToCheck: any[]) => {
        for (const f of filesToCheck) {
            const isFileExists = await runIsFileExistsAsChild({
                variables: {
                    treeId: filesTreeId,
                    parentNode: parentNode !== filesTreeId ? parentNode : null,
                    filename: f.name
                }
            });

            if (isFileExists.data.isFileExistsAsChild) {
                f.replace = await showReplaceModal(f.name);
            }
        }

        return filesToCheck;
    };

    useQuery<GET_TREE_LIBRARIES, GET_TREE_LIBRARIESVariables>(getTreeLibraries, {
        variables: {
            library: libraryId
        },
        onCompleted: getTreeLibrariesData => {
            const linkedTree = getTreeLibrariesData.trees.list.filter(
                tree => tree.system && tree.behavior === TreeBehavior.files
            )[0];

            setFilesTreeId(linkedTree.id);

            const directoriesLibrary = linkedTree.libraries.filter(
                l => l.library.behavior === LibraryBehavior.directories
            )[0]?.library.id;

            setdirectoriesLibraryId(directoriesLibrary);
        }
    });

    useQuery<GET_TREE_LIBRARIES, GET_TREE_LIBRARIESVariables>(getTreeLibraries, {
        skip: !!filesTreeId,
        variables: {
            library: libraryId
        },
        onCompleted: getTreeLibrariesData => {
            const index = getTreeLibrariesData.trees.list.findIndex(
                tree => tree.system && tree.behavior === TreeBehavior.files
            );

            setFilesTreeId(getTreeLibrariesData.trees.list[index].id);
        }
    });

    const [runUpload, {loading, error}] = useMutation<UPLOAD, UPLOADVariables>(uploadMutation, {
        fetchPolicy: 'no-cache',
        onCompleted: data => {
            if (typeof onCompleted !== 'undefined') {
                onCompleted(data);
            }

            setStatus('finish');
        },
        onError: err => {
            setStatus('error');
            setErrorMsg(err.message);
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
                nodeId: selectedNode.key,
                files: files.map(f => ({
                    data: f,
                    uid: f.uid,
                    size: f.size,
                    replace: f.replace
                }))
            }
        });
    };

    const _handleUploadClick = () => {
        next();
        startUpload();
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

    const onSelectPath = async (node: ITreeNodeWithRecord, selected: boolean) => {
        const newSelectedNode = !selected ? undefined : node;

        setSelectedNode(newSelectedNode);

        if (selected && files.length) {
            const newFiles = await _checkFilesExist(newSelectedNode?.id, files);
            setFiles(newFiles);
        }
    };

    const Dragger = () => (
        <Upload.Dragger {...props}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">{t('upload.dragger_content')}</p>
        </Upload.Dragger>
    );

    const isDone = !!files.length && files.every(f => typeof f.status !== 'undefined' && f.status !== 'uploading');

    const showReplaceModal = async (filename: string) =>
        new Promise(res => {
            confirm({
                closable: true,
                open: true,
                title: t('upload.replace_modal.title'),
                okText: t('upload.replace_modal.replaceBtn'),
                onOk: () => res(true),
                cancelText: t('upload.replace_modal.keepBtn'),
                onCancel: () => res(false),
                content: <p>{t('upload.replace_modal.message', {filename})}</p>
            });
        });

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
                    {filesTreeId && directoriesLibraryId && (
                        <SelectTreeNode
                            tree={{id: filesTreeId}}
                            onSelect={onSelectPath}
                            selectedNode={selectedNode?.key || defaultSelectedKey}
                            canSelectRoot
                            selectableLibraries={[directoriesLibraryId]}
                        />
                    )}
                </div>
            )
        },
        {
            title: t('upload.select_files_step_title'),
            content: <Dragger />
        },
        {
            title: t('upload.upload_step_title'),
            content: (
                <>
                    <Dragger />
                    {!!errorMsg && (
                        <>
                            <Divider />
                            <Alert message={errorMsg} type="error" />
                        </>
                    )}
                </>
            ),
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
                            <Button disabled={!selectedNode} type="primary" onClick={() => next()}>
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
                                onClick={_handleUploadClick}
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
