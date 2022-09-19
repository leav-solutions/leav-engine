// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    DeleteOutlined,
    ExpandAltOutlined,
    InfoCircleOutlined,
    OrderedListOutlined,
    SearchOutlined
} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Dropdown, Menu, message} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import {IconEllipsisVertical} from 'assets/icons/IconEllipsisVertical';
import {StandardBtn} from 'components/app/StyledComponent/StandardBtn';
import EditRecordModal from 'components/RecordEdition/EditRecordModal';
import {removeTreeElementMutation} from 'graphQL/mutations/trees/removeTreeElementMutation';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import useRefreshTreeContent from 'hooks/useRefreshTreeContent';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setNavigationPath} from 'redux/navigation';
import {addNotification} from 'redux/notifications';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {GET_TREE_LIBRARIES_trees_list_libraries} from '_gqlTypes/GET_TREE_LIBRARIES';
import {REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables} from '_gqlTypes/REMOVE_TREE_ELEMENT';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
import {INotification, NotificationChannel, NotificationType} from '_types/types';
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

    const [removeFromTree] = useMutation<REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables>(removeTreeElementMutation);
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const _handleClickDetails = () => {
        const newPath = [...navigation.path, {...parent, showDetails: true}];

        dispatch(setNavigationPath(newPath));
    };

    const _handleOpenEditRecordModal = () => setEditRecordModalVisible(true);
    const _handleCloseEditRecordModal = () => setEditRecordModalVisible(false);

    const _handleClickDetach = async () => {
        const label = parent.record.whoAmI.label;

        let notification: INotification;
        try {
            await removeFromTree({
                variables: {
                    treeId: activeTree.id,
                    nodeId: parent?.id ?? null
                }
            });

            notification = {
                channel: NotificationChannel.trigger,
                type: NotificationType.success,
                content: t('navigation.notifications.success-detach', {nb: 1})
            };
        } catch (e) {
            notification = {
                channel: NotificationChannel.trigger,
                type: NotificationType.error,
                content: t('navigation.notifications.error-detach', {
                    elementName: label ?? parent.record.id,
                    errorMessage: (e as Error).message
                })
            };
        }

        dispatch(addNotification(notification));
        refreshTreeContent();
    };

    const _handleClickClassifiedIn = () => message.warn(t('global.feature_not_available'));
    const _handleClickOrder = () => message.warn(t('global.feature_not_available'));

    const canEditChildren = parent ? parent.permissions.edit_children : activeTree.permissions.edit_children;
    const canDetach = !!parent && parent.permissions.detach;

    const treeActionsMenuItems: Array<ItemType & {displayCondition: boolean}> = [
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

    return (
        <>
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
                        <Dropdown placement="bottomRight" overlay={<Menu items={treeActionsMenuItems} />}>
                            <StandardBtn icon={<IconEllipsisVertical />} />
                        </Dropdown>
                    </span>
                </>
            )}
        </>
    );
}

export default DefaultActions;
