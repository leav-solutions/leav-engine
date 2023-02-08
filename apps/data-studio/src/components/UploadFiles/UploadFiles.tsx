// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InboxOutlined, LoadingOutlined, FileOutlined, CheckCircleTwoTone} from '@ant-design/icons';
import {Upload, Modal, Button, Steps, theme, StepProps, Alert, Divider, UploadFile} from 'antd';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery, useSubscription, useMutation, useLazyQuery} from '@apollo/client';
import {getUploadUpdates} from 'graphQL/subscribes/upload/getUploadUpdates';
import {UPLOAD, UPLOADVariables} from '_gqlTypes/UPLOAD';
import {uploadMutation} from '../../graphQL/mutations/upload/uploadMutation';
import {ITreeNodeWithRecord} from '../../_types/types';
import SelectTreeNode from '../shared/SelectTreeNode';
import {getTreeLibraries} from 'graphQL/queries/trees/getTreeLibraries';
import {GET_TREE_LIBRARIES, GET_TREE_LIBRARIESVariables} from '_gqlTypes/GET_TREE_LIBRARIES';
import {LibraryBehavior, TreeBehavior} from '_gqlTypes/globalTypes';
import {DOES_FILE_EXIST_AS_CHILD, DOES_FILE_EXIST_AS_CHILDVariables} from '_gqlTypes/DOES_FILE_EXIST_AS_CHILD';
import {doesFileExistAsChild} from 'graphQL/queries/records/doesFileExistAsChild';
import {useUser} from '../../hooks/UserHook/UserHook';
import {v4 as uuidv4} from 'uuid';

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
    const [selectedNodeKey, setSelectedNodeKey] = useState<string>(defaultSelectedKey);
    const [files, setFiles] = useState<Array<UploadFile & {replace?: boolean}>>([]);
    const [user] = useUser();
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
        disabled: status !== 'wait',
        beforeUpload: async (file: UploadFile) => {
            file.uid = uuidv4();

            const newFiles = await _checkFilesExist(selectedNodeKey, [file]);
            setFiles(prevState => prevState.concat(newFiles));

            return false;
        },
        onRemove: (file: UploadFile) => {
            const newFileList = files.filter(f => f.uid !== file.uid);
            setFiles(newFileList);
        },
        iconRender: (file: UploadFile) => {
            if (file.status === 'uploading') {
                return <LoadingOutlined />;
            } else if (file.status === 'success') {
                return <CheckCircleTwoTone twoToneColor={token.colorSuccess} />;
            }

            return <FileOutlined />;
        },
        progress: {showInfo: true, strokeWidth: 2}
    };

    const [runDoesFileExistAsChild] = useLazyQuery<DOES_FILE_EXIST_AS_CHILD, DOES_FILE_EXIST_AS_CHILDVariables>(
        doesFileExistAsChild,
        {
            fetchPolicy: 'no-cache'
        }
    );

    const _checkFilesExist = async (parentNode: string, filesToCheck: Array<UploadFile & {replace?: boolean}>) => {
        for (const f of filesToCheck) {
            const isFileExists = await runDoesFileExistAsChild({
                variables: {
                    treeId: filesTreeId,
                    parentNode: parentNode !== filesTreeId ? parentNode : null,
                    filename: f.name
                }
            });

            if (isFileExists.data.doesFileExistAsChild) {
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

    const [runUpload, {loading}] = useMutation<UPLOAD, UPLOADVariables>(uploadMutation, {
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
        variables: {filters: {userId: user?.userId}},
        skip: !user?.userId,
        onSubscriptionData: subData => {
            const uploadData = subData.subscriptionData.data.upload;

            setFiles(prevState =>
                prevState.map(f => {
                    if (f.uid === uploadData.uid) {
                        f.percent = uploadData.progress.percentage;
                        f.status = uploadData.progress.percentage === 100 ? 'success' : 'uploading';
                    }

                    return f;
                })
            );
        }
    });

    const startUpload = async (): Promise<void> => {
        setStatus('process');

        await runUpload({
            variables: {
                library: libraryId,
                nodeId: selectedNodeKey,
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

        setSelectedNodeKey(newSelectedNode.key);

        if (selected && files.length) {
            const newFiles = await _checkFilesExist(newSelectedNode?.id, files);
            setFiles(newFiles);
        }
    };

    const Dragger = (
        <Upload.Dragger data-testid="dragger" {...props}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">{t('upload.dragger_content')}</p>
        </Upload.Dragger>
    );
    const isDone = status === 'finish' || status === 'error';

    const showReplaceModal = async (filename: string): Promise<boolean> =>
        new Promise(res => {
            confirm({
                className: 'confirm-replace-modal',
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
                    data-testid="select-tree-node"
                    style={{
                        borderRadius: token.borderRadiusLG,
                        border: `1px dashed ${token.colorBorder}`
                    }}
                >
                    {filesTreeId && directoriesLibraryId && (
                        <SelectTreeNode
                            tree={{id: filesTreeId}}
                            onSelect={onSelectPath}
                            selectedNode={selectedNodeKey}
                            canSelectRoot
                            selectableLibraries={[directoriesLibraryId]}
                        />
                    )}
                </div>
            )
        },
        {
            title: t('upload.select_files_step_title'),
            content: Dragger
        },
        {
            title: t('upload.upload_step_title'),
            content: (
                <>
                    {Dragger}
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
                    <div style={{marginTop: 50}}>
                        {currentStep > 0 && currentStep < steps.length - 1 && (
                            <Button data-testid="prev-btn" onClick={() => prev()}>
                                {t('upload.previous')}
                            </Button>
                        )}
                        {currentStep < steps.length - 2 && (
                            <Button
                                data-testid="next-btn"
                                disabled={!selectedNodeKey}
                                type="primary"
                                onClick={() => next()}
                            >
                                {t('upload.next')}
                            </Button>
                        )}
                        {(!files.length || !isDone) && currentStep >= steps.length - 2 && (
                            <Button
                                data-testid="upload-btn"
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
                        {isDone && (
                            <Button data-testid="close-btn" onClick={_onClose}>
                                {t('global.close')}
                            </Button>
                        )}
                    </div>
                }
                data-testid="upload-modal"
                upload-modal
            >
                <Steps status={status} current={currentStep} items={items} />
                <div style={contentStyle}>{steps[currentStep].content}</div>
            </Modal>
        </>
    );
}

export default UploadFiles;
