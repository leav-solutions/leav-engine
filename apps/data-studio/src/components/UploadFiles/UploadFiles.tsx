// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InboxOutlined, LoadingOutlined, FileOutlined, CheckCircleTwoTone} from '@ant-design/icons';
import {
    Upload,
    Modal,
    Button,
    Steps,
    theme,
    StepProps,
    Alert,
    Divider,
    UploadFile,
    Tooltip,
    Space,
    Row,
    Checkbox
} from 'antd';
import {useEffect, useState} from 'react';
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
import {
    getDirectoryDataQuery,
    IDirectoryDataQuery,
    IDirectoryDataQueryVariables
} from 'graphQL/queries/records/getDirectoryDataQuery';
import {getLibraryGraphqlNames} from '@leav/utils';

const {confirm} = Modal;

interface IUploadFilesProps {
    defaultSelectedNode?: {id: string; recordId?: string};
    libraryId: string;
    multiple?: boolean;
    onClose: () => void;
    onCompleted?: (data: UPLOAD) => void;
}

function UploadFiles({
    defaultSelectedNode,
    libraryId,
    multiple = false,
    onCompleted,
    onClose
}: IUploadFilesProps): JSX.Element {
    const {t} = useTranslation();
    const {token} = theme.useToken();
    const [selectedNode, setSelectedNode] = useState<{id: string; recordId?: string}>(defaultSelectedNode);
    const [selectedDir, setSelectedDir] = useState<{path: string; name: string} | null>();
    const [files, setFiles] = useState<Array<UploadFile & {replace?: boolean}>>([]);
    const [user] = useUser();
    const [status, setStatus] = useState<StepProps['status']>('process');
    const [currentStep, setCurrentStep] = useState(!!defaultSelectedNode ? 1 : 0);
    const [filesTreeId, setFilesTreeId] = useState<string>();
    const [directoriesLibraryId, setdirectoriesLibraryId] = useState<string>();
    const [errorMsg, setErrorMsg] = useState<string>();

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

    useQuery<IDirectoryDataQuery, IDirectoryDataQueryVariables>(getDirectoryDataQuery(directoriesLibraryId), {
        skip: !directoriesLibraryId || !selectedNode?.recordId,
        onCompleted: data => {
            const dirData = data[getLibraryGraphqlNames(directoriesLibraryId).query].list[0];
            setSelectedDir({
                path: dirData.file_path,
                name: dirData.file_name
            });
        },
        variables: {
            directoryId: selectedNode?.recordId
        }
    });

    const props = {
        name: 'files',
        multiple,
        maxCount: multiple ? 99999 : 1,
        showUploadList: true,
        fileList: files,
        disabled: status !== 'process' || loading,
        beforeUpload: async (file: UploadFile) => {
            file.uid = uuidv4();
            setFiles(prevState => prevState.concat([file]));

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

    const _checkFilesExist = async (parentNode: string): Promise<void> => {
        let applyToAll: {replace: boolean};

        const filesToCheck = [...files];

        for (const f of filesToCheck) {
            if (applyToAll) {
                f.replace = f.replace ?? applyToAll.replace;
            } else {
                const isFileExists = await runDoesFileExistAsChild({
                    variables: {
                        treeId: filesTreeId,
                        parentNode: parentNode !== filesTreeId ? parentNode : null,
                        filename: f.name
                    }
                });

                if (isFileExists.data.doesFileExistAsChild) {
                    const {applyToAll: mustBeAppliedToAll, replace} = await showReplaceModal(f.name);
                    Modal.destroyAll();

                    f.replace = replace;

                    if (mustBeAppliedToAll) {
                        applyToAll = {replace};
                    }
                }
            }
        }

        setFiles(filesToCheck);
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
        await runUpload({
            variables: {
                library: libraryId,
                nodeId: selectedNode.id,
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
        _checkFilesExist(selectedNode.id).then(() => {
            next();
            startUpload();
        });
    };

    const _onClose = () => {
        setFiles([]);
        onClose();
    };

    const contentStyle: React.CSSProperties = {
        marginTop: 16
    };

    const next = () => {
        setCurrentStep(currentStep + 1);
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    const onSelectPath = async (node: ITreeNodeWithRecord, selected: boolean) => {
        const newSelectedNode = !selected ? undefined : {id: node.id, recordId: node.record?.id};

        setSelectedNode(newSelectedNode);

        if (!newSelectedNode?.recordId) {
            setSelectedDir(null);
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

    const showReplaceModal = async (filename: string): Promise<{replace: boolean; applyToAll: boolean}> =>
        new Promise(res => {
            let applyToAll = false;

            confirm({
                className: 'confirm-replace-modal',
                closable: true,
                open: true,
                title: t('upload.replace_modal.title'),
                content: <p>{t('upload.replace_modal.message', {filename})}</p>,
                footer: (
                    <Row justify="end">
                        <Space>
                            <Checkbox
                                onChange={e => {
                                    applyToAll = e.target.checked;
                                }}
                            >
                                {t('upload.replace_modal.applyToAll')}
                            </Checkbox>
                            <Button key="keepBtn" onClick={() => res({replace: false, applyToAll})}>
                                {t('upload.replace_modal.keepBtn')}
                            </Button>
                            <Button key="replaceBtn" type="primary" onClick={() => res({replace: true, applyToAll})}>
                                {t('upload.replace_modal.replaceBtn')}
                            </Button>
                        </Space>
                    </Row>
                )
            });
        });

    const PathTitle = () => {
        const title = selectedNode
            ? selectedDir
                ? `${selectedDir?.path}/${selectedDir?.name}`.replace('./', '')
                : filesTreeId
            : t('upload.select_path_step_title');

        return <Tooltip title={title}>{title?.length > 30 ? `${title.slice(0, 30)}...` : title}</Tooltip>;
    };

    const steps = [
        {
            title: <PathTitle />,
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
                            selectedNode={selectedNode?.id}
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
                                disabled={!selectedNode}
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
                                {t('upload.upload_step_title')}
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
