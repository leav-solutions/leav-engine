// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal, Button, Steps, theme, StepProps, Alert, Divider, Input} from 'antd';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery, useMutation, useLazyQuery} from '@apollo/client';
import {ITreeNodeWithRecord} from '../../_types/types';
import SelectTreeNode from '../shared/SelectTreeNode';
import {getTreeLibraries} from 'graphQL/queries/trees/getTreeLibraries';
import {GET_TREE_LIBRARIES, GET_TREE_LIBRARIESVariables} from '_gqlTypes/GET_TREE_LIBRARIES';
import {TreeBehavior} from '_gqlTypes/globalTypes';
import {DOES_FILE_EXIST_AS_CHILD, DOES_FILE_EXIST_AS_CHILDVariables} from '_gqlTypes/DOES_FILE_EXIST_AS_CHILD';
import {doesFileExistAsChild} from 'graphQL/queries/records/doesFileExistAsChild';
import {useUser} from '../../hooks/UserHook/UserHook';
import {CREATE_DIRECTORY, CREATE_DIRECTORYVariables} from '_gqlTypes/CREATE_DIRECTORY';
import {createDirectoryMutation} from '../../graphQL/mutations/directories/createDirectory';

const {warning} = Modal;

interface ICreateDirectoryProps {
    defaultSelectedKey?: string;
    libraryId: string;
    onClose: () => void;
    onCompleted?: (data: CREATE_DIRECTORY) => void;
}

function CreateDirectory({defaultSelectedKey, libraryId, onCompleted, onClose}: ICreateDirectoryProps): JSX.Element {
    const {t} = useTranslation();
    const {token} = theme.useToken();
    const [selectedNodeKey, setSelectedNodeKey] = useState<string>(defaultSelectedKey);
    const [user] = useUser();
    const [directoryName, setDirectoryName] = useState<string>();
    const [status, setStatus] = useState<StepProps['status']>('wait');
    const [currentStep, setCurrentStep] = useState(!!defaultSelectedKey ? 1 : 0);
    const [treeId, setTreeId] = useState<string>();

    const [runDoesFileExistAsChild] = useLazyQuery<DOES_FILE_EXIST_AS_CHILD, DOES_FILE_EXIST_AS_CHILDVariables>(
        doesFileExistAsChild,
        {
            fetchPolicy: 'no-cache'
        }
    );

    const _checkDirectoryExists = async (parentNode: string, name: string): Promise<boolean> => {
        const isFileExists = await runDoesFileExistAsChild({
            variables: {
                treeId,
                parentNode: parentNode !== treeId ? parentNode : null,
                filename: name
            }
        });

        return isFileExists.data.doesFileExistAsChild;
    };

    useQuery<GET_TREE_LIBRARIES, GET_TREE_LIBRARIESVariables>(getTreeLibraries, {
        variables: {
            library: libraryId
        },
        onCompleted: getTreeLibrariesData => {
            const linkedTree = getTreeLibrariesData.trees.list.filter(
                tree => tree.system && tree.behavior === TreeBehavior.files
            )[0];

            setTreeId(linkedTree.id);
        }
    });

    const [runCreateDirectory, {loading}] = useMutation<CREATE_DIRECTORY, CREATE_DIRECTORYVariables>(
        createDirectoryMutation,
        {
            fetchPolicy: 'no-cache',
            onCompleted: data => {
                if (typeof onCompleted !== 'undefined') {
                    onCompleted(data);
                }

                setStatus('finish');
            },
            onError: err => {
                setStatus('error');
            }
        }
    );

    const _handleCreateClick = async () => {
        if (await _checkDirectoryExists(selectedNodeKey, directoryName)) {
            showDuplicateNameModal();
            return;
        }

        setStatus('process');

        await runCreateDirectory({
            variables: {
                library: libraryId,
                nodeId: selectedNodeKey,
                name: directoryName
            }
        });

        _onClose();
    };

    const _onClose = () => {
        setDirectoryName('');
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

        if (directoryName && newSelectedNode && (await _checkDirectoryExists(newSelectedNode?.id, directoryName))) {
            showDuplicateNameModal();
            return;
        }

        setSelectedNodeKey(newSelectedNode?.key);
    };

    const showDuplicateNameModal = () => {
        warning({
            className: 'warning-duplicate-modal',
            closable: true,
            open: true,
            title: t('create_directory.duplicate_modal.title'),
            okText: t('global.ok'),
            content: <p>{t('create_directory.duplicate_modal.message', {directoryName})}</p>
        });
    };

    const steps = [
        {
            title: t('create_directory.select_path_step_title'),
            content: (
                <div
                    data-testid="select-tree-node"
                    style={{
                        borderRadius: token.borderRadiusLG,
                        border: `1px dashed ${token.colorBorder}`
                    }}
                >
                    {treeId && libraryId && (
                        <SelectTreeNode
                            tree={{id: treeId}}
                            onSelect={onSelectPath}
                            selectedNode={selectedNodeKey}
                            canSelectRoot
                            selectableLibraries={[libraryId]}
                        />
                    )}
                </div>
            )
        },
        {
            title: t('create_directory.choose_name_step_title'),
            content: (
                <Input
                    data-testid="directory-name-input"
                    placeholder={t('create_directory.directory_name')}
                    value={directoryName}
                    onChange={e => setDirectoryName(e.target.value)}
                />
            )
        }
    ];

    const items = steps.map(item => ({key: item.title, title: item.title}));

    return (
        <Modal
            data-testid="create-directory-modal"
            title={t('create_directory.title')}
            open
            width="70rem"
            onCancel={_onClose}
            footer={
                <div style={{marginTop: 50}}>
                    {currentStep > 0 && (
                        <Button data-testid="prev-btn" onClick={() => prev()}>
                            {t('create_directory.previous')}
                        </Button>
                    )}
                    {currentStep < steps.length - 1 && (
                        <Button
                            data-testid="next-btn"
                            disabled={!selectedNodeKey}
                            type="primary"
                            onClick={() => next()}
                        >
                            {t('create_directory.next')}
                        </Button>
                    )}
                    {currentStep > 0 && (
                        <Button
                            data-testid="create-btn"
                            loading={loading}
                            disabled={!directoryName}
                            className="submit-btn"
                            title={'Create'}
                            type="primary"
                            onClick={_handleCreateClick}
                        >
                            {t('create_directory.create_step_title')}
                        </Button>
                    )}
                </div>
            }
            upload-modal
        >
            <Steps status={status} current={currentStep} items={items} />
            <div style={contentStyle}>{steps[currentStep].content}</div>
        </Modal>
    );
}

export default CreateDirectory;
