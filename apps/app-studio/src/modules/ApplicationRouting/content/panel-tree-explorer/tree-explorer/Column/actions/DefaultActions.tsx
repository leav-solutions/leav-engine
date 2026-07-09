import {useState} from 'react';
import {
    CloudUploadOutlined,
    DeleteOutlined,
    ExpandAltOutlined,
    FolderAddOutlined,
    InfoCircleOutlined,
    MoreOutlined,
    PictureOutlined,
} from '@ant-design/icons';
import {CreateDirectory, EditRecordModal, TriggerPreviewsGenerationModal, UploadFiles, useConfirmModal} from '@leav/ui';
import {Button, Dropdown} from 'antd';
import {type ItemType} from 'antd/es/menu/interface';
import {KitAlert} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
import {LibraryBehavior, TreeBehavior, useRemoveTreeElementMutation} from '../../../../../../../__generated__';
import {type ITreeExplorerNode, type OnMessagesFunc} from '../../_types';
import {type ITreeAllowedChildLibrary} from '../../hooks/useTreeLibraryAllowedAsChild';
import {useRefreshTreeContent} from '../../hooks/useRefreshTreeContent';
import {useTreeExplorerState} from '../../store/useTreeExplorerState';
import {getDirectoriesLibraryId, getFilesLibraryId} from '../../utils';
import {AddByCreationButton} from './AddByCreationButton';
import {AddBySearchButton} from './AddBySearchButton';

export const DefaultActions = ({
    isDetail,
    parent,
    allowedChildrenLibraries,
    onMessages,
}: {
    isDetail: boolean;
    parent?: ITreeExplorerNode;
    allowedChildrenLibraries: ITreeAllowedChildLibrary[];
    onMessages: OnMessagesFunc;
}) => {
    const {t} = useTranslation();
    const {activeTree, path, selection, setPath} = useTreeExplorerState();
    const hasSelection = !!selection.selected.length;
    const [displayPreviewConfirm, setDisplayPreviewConfirm] = useState(false);
    const [editRecordModalVisible, setEditRecordVisible] = useState(false);
    const [isUploadFilesModalVisible, setIsUploadFilesModalVisible] = useState(false);
    const [isCreateDirectoryModalVisible, setIsCreateDirectoryModalVisible] = useState(false);

    const [removeFromTree] = useRemoveTreeElementMutation();
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);
    const {openConfirmModal} = useConfirmModal();

    const _handleClickDetails = () => {
        const parentIndex = path.findIndex(p => p.id === parent?.id);
        const newPath = [...path];
        newPath[parentIndex] = {...parent, showDetails: true};

        setPath(newPath);
    };

    const _handleOpenEditRecord = () => setEditRecordVisible(true);
    const _handleCloseEditRecord = () => setEditRecordVisible(false);

    const _detachElement = async () => {
        const label = parent.record.whoAmI.label;

        try {
            await removeFromTree({
                variables: {
                    treeId: activeTree.id,
                    nodeId: parent?.id ?? null,
                },
            });

            KitAlert.success({
                message: t('tree_explorer.infos.success_detach', {nb: 1}),
                duration: SUCCESS_NOTIFICATION_DURATION,
                showIcon: true,
            });
        } catch (e) {
            KitAlert.error({
                message: t('tree_explorer.infos.error_detach', {
                    elements: label ?? parent.record.id,
                    errorMessage: (e as Error).message,
                }),
                duration: ERROR_NOTIFICATION_DURATION,
                closable: true,
                showIcon: true,
            });
        }

        refreshTreeContent();
    };

    const _handleClickDetach = () => {
        openConfirmModal({
            title: t('tree_explorer.confirm.detach_title'),
            content: t('tree_explorer.confirm.detach_content', {
                label: parent?.record.whoAmI.label ?? parent?.record.id,
            }),
            dangerConfirm: true,
            onOk: _detachElement,
        });
    };

    const _handleClickUpload = () => setIsUploadFilesModalVisible(true);
    const _handleCloseUpload = () => setIsUploadFilesModalVisible(false);

    const _handleCreateDirectory = () => setIsCreateDirectoryModalVisible(true);
    const _handleCloseCreateDirectory = () => setIsCreateDirectoryModalVisible(false);

    const _handleClickGeneratePreviews = () => setDisplayPreviewConfirm(true);
    const _handleClosePreviewGenerationConfirm = () => setDisplayPreviewConfirm(false);

    const canEditChildren = parent ? parent.permissions.edit_children : activeTree.permissions.edit_children;
    const canDetach = !!parent && parent.permissions.detach;
    const isFilesTree = activeTree.behavior === TreeBehavior.files;
    const isDirectoryParent = !parent || parent?.record.whoAmI.library.behavior === LibraryBehavior.directories;

    const treeActionsMenuItems: ItemType[] = (
        [
            {
                displayCondition: isFilesTree && isDirectoryParent,
                item: {
                    key: 'upload',
                    icon: <CloudUploadOutlined />,
                    onClick: _handleClickUpload,
                    label: t('tree_explorer.actions.upload'),
                },
            },
            {
                displayCondition: isFilesTree && isDirectoryParent,
                item: {
                    key: 'create_directory',
                    icon: <FolderAddOutlined />,
                    onClick: _handleCreateDirectory,
                    label: t('tree_explorer.actions.create_directory'),
                },
            },
            {
                displayCondition: !!parent && !isDetail,
                item: {
                    key: 'details',
                    icon: <InfoCircleOutlined />,
                    onClick: _handleClickDetails,
                    label: t('tree_explorer.actions.details'),
                },
            },
            {
                displayCondition: !!parent,
                item: {
                    key: 'edit',
                    icon: <ExpandAltOutlined />,
                    onClick: _handleOpenEditRecord,
                    label: t('tree_explorer.actions.edit'),
                },
            },
            {
                displayCondition: isFilesTree,
                item: {
                    key: 'generate_previews',
                    label: t('tree_explorer.actions.generate_previews'),
                    icon: <PictureOutlined />,
                    onClick: _handleClickGeneratePreviews,
                },
            },
            {displayCondition: canEditChildren && canDetach, item: {key: 'divider', type: 'divider'}},
            {
                displayCondition: canEditChildren && canDetach,
                item: {
                    key: 'detach',
                    icon: <DeleteOutlined />,
                    onClick: _handleClickDetach,
                    label: t('tree_explorer.actions.detach'),
                },
            },
        ] satisfies Array<{displayCondition: boolean; item: ItemType}>
    )
        .filter(entry => entry.displayCondition)
        .map(entry => entry.item);

    const _handleRefreshAfterModal = () => refreshTreeContent();

    const filesLibraryId = getFilesLibraryId(activeTree);

    return (
        <>
            {isUploadFilesModalVisible && (
                <UploadFiles
                    defaultSelectedNode={{id: parent?.id || activeTree.id, recordId: parent?.record.id}}
                    libraryId={getFilesLibraryId(activeTree)}
                    multiple
                    onClose={_handleCloseUpload}
                    onCompleted={_handleRefreshAfterModal}
                />
            )}
            {isCreateDirectoryModalVisible && (
                <CreateDirectory
                    defaultSelectedKey={parent?.id || activeTree.id}
                    libraryId={parent?.record.whoAmI.library.id || getDirectoriesLibraryId(activeTree)}
                    onClose={_handleCloseCreateDirectory}
                    onCompleted={_handleRefreshAfterModal}
                />
            )}
            {editRecordModalVisible && (
                <EditRecordModal
                    open={editRecordModalVisible}
                    library={parent.record.whoAmI.library.id}
                    record={parent.record.whoAmI}
                    onClose={_handleCloseEditRecord}
                />
            )}
            {!hasSelection && (
                <>
                    {canEditChildren && (
                        <>
                            <AddBySearchButton
                                availableLibraries={allowedChildrenLibraries}
                                parent={parent}
                                onMessages={onMessages}
                            />
                            <AddByCreationButton
                                availableLibraries={allowedChildrenLibraries}
                                parent={parent}
                                onMessages={onMessages}
                            />
                        </>
                    )}
                    {treeActionsMenuItems.length > 0 && (
                        <span data-testid="dropdown-tree-actions">
                            <Dropdown placement="bottomRight" menu={{items: treeActionsMenuItems}}>
                                <Button icon={<MoreOutlined />} />
                            </Dropdown>
                        </span>
                    )}
                </>
            )}
            {displayPreviewConfirm && (
                <TriggerPreviewsGenerationModal
                    libraryId={parent?.record?.whoAmI?.library?.id}
                    filesLibraryId={filesLibraryId}
                    {...(parent && {recordIds: [parent?.record.id]})}
                    onClose={_handleClosePreviewGenerationConfirm}
                />
            )}
        </>
    );
};
