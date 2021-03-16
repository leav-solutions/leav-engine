// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ArrowDownOutlined, PlusOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Dropdown, Menu} from 'antd';
import {IconEllipsisVertical} from 'assets/icons/IconEllipsisVertical';
import {StandardBtn} from 'components/app/StyledComponent/StandardBtn';
import {useNotifications} from 'hooks/NotificationsHook/NotificationsHook';
import {resetSharedSelection} from 'hooks/SharedStateHook/SharedReducerActions';
import useStateShared from 'hooks/SharedStateHook/SharedReducerHook';
import {SharedStateSelectionType} from 'hooks/SharedStateHook/SharedStateReducer';
import {addTreeElementMutation} from 'mutations/trees/addTreeElementMutation';
import {moveTreeElementMutation} from 'mutations/trees/moveTreeElementMutation';
import {removeTreeElementMutation} from 'mutations/trees/removeTreeElementMutation';
import {getTreeContentQuery, IRecordAndChildren} from 'queries/trees/getTreeContentQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {setRefetchTreeData} from 'Reducer/NavigationReducerActions';
import {ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables} from '_gqlTypes/ADD_TREE_ELEMENT';
import {MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables} from '_gqlTypes/MOVE_TREE_ELEMENT';
import {REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables} from '_gqlTypes/REMOVE_TREE_ELEMENT';
import {NotificationChannel, NotificationType} from '_types/types';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {useActiveTree} from '../../hooks/ActiveTreeHook/ActiveTreeHook';

interface IActiveHeaderCellNavigationProps {
    depth: number;
    setItems?: React.Dispatch<React.SetStateAction<IRecordAndChildren[]>>;
    isDetail?: boolean;
}

function ActiveHeaderCellNavigation({depth, setItems, isDetail}: IActiveHeaderCellNavigationProps): JSX.Element {
    const {t} = useTranslation();
    const currentPositionInPath = depth;

    const {stateNavigation, dispatchNavigation} = useStateNavigation();
    const {stateShared, dispatchShared} = useStateShared();
    const {addNotification} = useNotifications();

    const [activeTree] = useActiveTree();

    const parent = stateNavigation.path[currentPositionInPath - 1];

    const [removeFromTree] = useMutation<REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables>(removeTreeElementMutation, {
        refetchQueries: [{query: getTreeContentQuery(depth), variables: {treeId: activeTree?.id}}]
    });
    const [addToTree] = useMutation<ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables>(addTreeElementMutation);
    const [moveInTree] = useMutation<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>(moveTreeElementMutation);

    const handleSortAsc = (e: any) => {
        if (setItems) {
            setItems(items => {
                const newItems = [...items].sort((a, b) => {
                    return parseInt(a.record.whoAmI.id, 10) - parseInt(b.record.whoAmI.id, 10);
                });

                return newItems;
            });
        }
    };

    const handleSortDesc = (e: any) => {
        if (setItems) {
            setItems(items => {
                const newItems = [...items].sort(
                    (a, b) => parseInt(b.record.whoAmI.id, 10) - parseInt(a.record.whoAmI.id, 10)
                );
                return newItems;
            });
        }
    };

    const handleAddElements = async () => {
        if (stateShared.selection.selected.length) {
            const parentElement = parent?.id
                ? {
                      id: parent.id,
                      library: parent.library
                  }
                : null;

            for (const elementSelected of stateShared.selection.selected) {
                try {
                    await addToTree({
                        variables: {
                            treeId: activeTree.id,
                            element: elementSelected,
                            parent: parentElement
                        }
                    });
                    addNotification({
                        channel: NotificationChannel.trigger,
                        type: NotificationType.success,
                        content: t('navigation.notifications.success-add', {
                            elementId: elementSelected.id
                        })
                    });
                } catch (e) {
                    console.error(e);
                    addNotification({
                        channel: NotificationChannel.trigger,
                        type: NotificationType.warning,
                        content: t('navigation.notifications.error-add', {
                            elementId: elementSelected.id,
                            errorMessage: e.message
                        })
                    });
                }
            }
        } else {
            addNotification({
                channel: NotificationChannel.trigger,
                type: NotificationType.warning,
                content: t('navigation.notifications.warning-add-no-selection')
            });
        }

        dispatchShared(resetSharedSelection());
        dispatchNavigation(setRefetchTreeData(true));
    };

    const handleMoveEnd = async () => {
        const parentTo = parent?.id
            ? {
                  id: parent.id,
                  library: parent.library
              }
            : null;

        for (const element of stateShared.selection.selected) {
            await moveInTree({
                variables: {
                    treeId: activeTree.id,
                    element,
                    parentTo
                }
            });
        }

        dispatchShared(resetSharedSelection());
        dispatchNavigation(setRefetchTreeData(true));
    };

    const handleDeleteCurrentElement = async () => {
        const element = {
            id: stateNavigation.recordDetail.whoAmI.id,
            library: stateNavigation.recordDetail.whoAmI.library.id
        };

        try {
            await removeFromTree({
                variables: {
                    treeId: activeTree.id,
                    element
                }
            });

            addNotification({
                channel: NotificationChannel.trigger,
                type: NotificationType.success,
                content: t('navigation.notifications.success-detach', {
                    elementId: element.id
                })
            });
        } catch (e) {
            addNotification({
                channel: NotificationChannel.trigger,
                type: NotificationType.error,
                content: t('navigation.notifications.error-detach', {
                    elementId: element.id,
                    errorMessage: e.message
                })
            });
        }

        dispatchNavigation(setRefetchTreeData(true));
    };

    const handleDeleteElements = async () => {
        if (stateShared.selection.type === SharedStateSelectionType.navigation) {
            for (const element of stateShared.selection.selected) {
                try {
                    await removeFromTree({
                        variables: {
                            treeId: activeTree.id,
                            element
                        }
                    });

                    addNotification({
                        channel: NotificationChannel.trigger,
                        type: NotificationType.success,
                        content: t('navigation.notifications.success-detach', {
                            elementId: element.id
                        })
                    });
                } catch (e) {
                    addNotification({
                        channel: NotificationChannel.trigger,
                        type: NotificationType.error,
                        content: t('navigation.notifications.error-detach', {
                            elementId: element.id,
                            errorMessage: e.message
                        })
                    });
                }
            }

            dispatchShared(resetSharedSelection());
            dispatchNavigation(setRefetchTreeData(true));
        }
    };

    if (stateShared.selection.selected.length) {
        return (
            <span
                onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <span data-testid="add-tree-element-button">
                    <StandardBtn icon={<PlusOutlined />} onClick={handleAddElements} />
                </span>
                <span>
                    <StandardBtn
                        onClick={handleMoveEnd}
                        icon={<ArrowDownOutlined />}
                        title={t('navigation.actions.move-selected')}
                    />
                </span>
            </span>
        );
    }
    return (
        <span>
            <span
                onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <span data-testid="add-tree-element-button">
                    <StandardBtn icon={<PlusOutlined />} onClick={handleAddElements} />
                </span>

                <span data-testid="tree-actions-dropdown">
                    <Dropdown
                        placement="bottomRight"
                        overlay={
                            <Menu>
                                <Menu>
                                    {isDetail ? (
                                        <>
                                            <Menu.Item onClick={handleDeleteCurrentElement}>
                                                {t('navigation.actions.detach-element')}
                                            </Menu.Item>
                                        </>
                                    ) : (
                                        <>
                                            <Menu.Item onClick={handleSortAsc}>
                                                {t('navigation.actions.sort-asc')}
                                            </Menu.Item>
                                            <Menu.Item onClick={handleSortDesc}>
                                                {t('navigation.actions.sort-desc')}
                                            </Menu.Item>
                                            <Menu.Item onClick={handleDeleteElements}>
                                                {t('navigation.actions.detach-selected')}
                                            </Menu.Item>
                                        </>
                                    )}
                                </Menu>
                            </Menu>
                        }
                    >
                        <StandardBtn icon={<IconEllipsisVertical />} />
                    </Dropdown>
                </span>
            </span>
        </span>
    );
}

export default ActiveHeaderCellNavigation;
