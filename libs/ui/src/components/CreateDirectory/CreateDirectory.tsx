// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Input, Modal, StepProps, Steps, theme} from 'antd';
import {useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ITreeNodeWithRecord} from '_ui/types/trees';
import {
    CreateDirectoryMutation,
    TreeBehavior,
    useCreateDirectoryMutation,
    useDoesFileExistAsChildLazyQuery,
    useGetTreeLibrariesQuery
} from '_ui/_gqlTypes';
import {SelectTreeNode} from '../SelectTreeNode';

const {warning} = Modal;

interface ICreateDirectoryProps {
    defaultSelectedKey?: string;
    libraryId: string;
    onClose: () => void;
    onCompleted?: (data: CreateDirectoryMutation['createDirectory']) => void;
}

function CreateDirectory({defaultSelectedKey, libraryId, onCompleted, onClose}: ICreateDirectoryProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {token} = theme.useToken();
    const [selectedNodeKey, setSelectedNodeKey] = useState<string>(defaultSelectedKey);
    const [directoryName, setDirectoryName] = useState<string>();
    const [status, setStatus] = useState<StepProps['status']>('wait');
    const [currentStep, setCurrentStep] = useState(!!defaultSelectedKey ? 1 : 0);
    const [treeId, setTreeId] = useState<string>();

    const [runDoesFileExistAsChild] = useDoesFileExistAsChildLazyQuery({
        fetchPolicy: 'no-cache'
    });

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

    useGetTreeLibrariesQuery({
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

    const [runCreateDirectory, {loading}] = useCreateDirectoryMutation({
        fetchPolicy: 'no-cache',
        onCompleted: data => {
            if (typeof onCompleted !== 'undefined') {
                onCompleted(data.createDirectory);
            }

            setStatus('finish');
        },
        onError: err => {
            setStatus('error');
        }
    });

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
                            treeId={treeId}
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
                            title="Create"
                            type="primary"
                            onClick={_handleCreateClick}
                        >
                            {t('create_directory.create_step_title')}
                        </Button>
                    )}
                </div>
            }
        >
            <Steps status={status} current={currentStep} items={items} />
            <div style={contentStyle}>{steps[currentStep].content}</div>
        </Modal>
    );
}

export default CreateDirectory;
