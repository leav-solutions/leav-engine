// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    DeleteOutlined,
    ExpandAltOutlined,
    InfoCircleOutlined,
    OrderedListOutlined,
    SearchOutlined,
    CloudUploadOutlined
} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Button, Dropdown, message} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import {IconEllipsisVertical} from 'assets/icons/IconEllipsisVertical';
import EditRecordModal from 'components/RecordEdition/EditRecordModal';
import UploadFiles from 'components/UploadFiles';
import {removeTreeElementMutation} from 'graphQL/mutations/trees/removeTreeElementMutation';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import useRefreshTreeContent from 'hooks/useRefreshTreeContent';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {addInfo} from 'reduxStore/infos';
import {setNavigationPath} from 'reduxStore/navigation';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {GET_TREE_LIBRARIES_trees_list_libraries} from '_gqlTypes/GET_TREE_LIBRARIES';
import {LibraryBehavior, TreeBehavior} from '_gqlTypes/globalTypes';
import {REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables} from '_gqlTypes/REMOVE_TREE_ELEMENT';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
import {IInfo, InfoChannel, InfoType} from '_types/types';
import {OnMessagesFunc} from '../_types';
import AddByCreationButton from './AddByCreationButton';
import AddBySearchButton from './AddBySearchButton';

interface IDefaultActionsProps {
    isDetail: boolean;
    parent?: TREE_NODE_CHILDREN_treeNodeChildren_list;
    allowedChildrenLibraries: GET_TREE_LIBRARIES_trees_list_libraries[];
    onMessages: OnMessagesFunc;
}

function DefaultActions({isDetail, parent, allowedChildrenLibraries, onMessages}: IDefaultActionsProps): JSX.Element {
    const {t} = useTranslation();
    const dispatch = useAppDispatch();
    const {selectionState, navigation} = useAppSelector(state => ({
        selectionState: state.selection,
        navigation: state.navigation
    }));
    const hasSelection = !!selectionState.selection.selected.length;
    const [activeTree] = useActiveTree();

    const [editRecordModalVisible, setEditRecordModalVisible] = useState(false);
    const [isUploadFilesModalVisible, setIsUploadFilesModalVisible] = useState<boolean>(false);

    const [removeFromTree] = useMutation<REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables>(removeTreeElementMutation);
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const _handleClickDetails = () => {
        const parentIndex = navigation.path.findIndex(p => p.id === parent?.id);
        const newPath = [...navigation.path];
        newPath[parentIndex] = {...parent, showDetails: true};

        dispatch(setNavigationPath(newPath));
    };

    const _handleOpenEditRecordModal = () => setEditRecordModalVisible(true);
    const _handleCloseEditRecordModal = () => setEditRecordModalVisible(false);

    const _handleClickDetach = async () => {
        const label = parent.record.whoAmI.label;

        let info: IInfo;
        try {
            await removeFromTree({
                variables: {
                    treeId: activeTree.id,
                    nodeId: parent?.id ?? null
                }
            });

            info = {
                channel: InfoChannel.trigger,
                type: InfoType.success,
                content: t('navigation.infos.success-detach', {nb: 1})
            };
        } catch (e) {
            info = {
                channel: InfoChannel.trigger,
                type: InfoType.error,
                content: t('navigation.infos.error-detach', {
                    elementName: label ?? parent.record.id,
                    errorMessage: (e as Error).message
                })
            };
        }

        dispatch(addInfo(info));
        refreshTreeContent();
    };

    const _handleClickUpload = () => setIsUploadFilesModalVisible(true);
    const _handleCloseUpload = () => setIsUploadFilesModalVisible(false);

    const _handleClickClassifiedIn = () => message.warning(t('global.feature_not_available'));
    const _handleClickOrder = () => message.warning(t('global.feature_not_available'));

    const canEditChildren = parent ? parent.permissions.edit_children : activeTree.permissions.edit_children;
    const canDetach = !!parent && parent.permissions.detach;

    const treeActionsMenuItems: Array<ItemType & {displayCondition: boolean}> = [
        {
            key: 'upload',
            icon: <CloudUploadOutlined />,
            onClick: _handleClickUpload,
            label: t('upload.title'),
            displayCondition:
                activeTree.behavior === TreeBehavior.files &&
                (!parent || parent?.record.whoAmI.library.behavior === LibraryBehavior.directories)
        },
        {
            key: 'details',
            icon: <InfoCircleOutlined />,
            onClick: _handleClickDetails,
            label: t('navigation.actions.details'),
            displayCondition: !!parent && !isDetail
        },
        {
            key: 'edit',
            icon: <ExpandAltOutlined />,
            onClick: _handleOpenEditRecordModal,
            label: t('navigation.actions.edit'),
            displayCondition: !!parent
        },
        {
            key: 'classified_in',
            icon: <SearchOutlined />,
            onClick: _handleClickClassifiedIn,
            label: t('navigation.actions.classified_in'),
            displayCondition: true
        },
        {key: 'divider', type: 'divider', displayCondition: canEditChildren},
        {
            key: 'order',
            icon: <OrderedListOutlined />,
            onClick: _handleClickOrder,
            label: t('navigation.actions.order'),
            displayCondition: canEditChildren
        },
        {
            key: 'detach',
            icon: <DeleteOutlined />,
            onClick: _handleClickDetach,
            label: t('navigation.actions.detach'),
            displayCondition: canEditChildren && canDetach
        }
    ].reduce((displayedItems, item) => {
        if (item.displayCondition) {
            // "displayCondition" is not a valid prop for menu items and ends up in the DOM element,
            // generating a warning. Remove it.
            const {displayCondition, ...itemProps} = item;
            displayedItems.push(itemProps);
        }

        return displayedItems;
    }, []);

    const _handleUploadCompleted = () => {
        refreshTreeContent();
    };

    return (
        <>
            {isUploadFilesModalVisible && (
                <UploadFiles
                    defaultSelectedKey={parent?.id || activeTree.id}
                    libraryId={activeTree.libraries[0].id}
                    multiple
                    onClose={_handleCloseUpload}
                    onCompleted={_handleUploadCompleted}
                />
            )}
            {editRecordModalVisible && (
                <EditRecordModal
                    open={editRecordModalVisible}
                    library={parent.record.whoAmI.library.id}
                    record={parent.record.whoAmI}
                    onClose={_handleCloseEditRecordModal}
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
                    <span data-testid="dropdown-tree-actions">
                        <Dropdown placement="bottomRight" menu={{items: treeActionsMenuItems}}>
                            <Button icon={<IconEllipsisVertical />} />
                        </Dropdown>
                    </span>
                </>
            )}
        </>
    );
}

export default DefaultActions;
