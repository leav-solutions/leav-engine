// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ArrowDownOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {StandardBtn} from 'components/app/StyledComponent/StandardBtn';
import {addTreeElementMutation} from 'graphQL/mutations/trees/addTreeElementMutation';
import {moveTreeElementMutation} from 'graphQL/mutations/trees/moveTreeElementMutation';
import {removeTreeElementMutation} from 'graphQL/mutations/trees/removeTreeElementMutation';
import {ITreeContentRecordAndChildren} from 'graphQL/queries/trees/getTreeContentQuery';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import useRefreshTreeContent from 'hooks/useRefreshTreeContent';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {setNavigationPath} from 'redux/navigation';
import {addNotification} from 'redux/notifications';
import {resetSelection} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables} from '_gqlTypes/ADD_TREE_ELEMENT';
import {TreeElementInput} from '_gqlTypes/globalTypes';
import {MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables} from '_gqlTypes/MOVE_TREE_ELEMENT';
import {REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables} from '_gqlTypes/REMOVE_TREE_ELEMENT';
import {INotification, NotificationChannel, NotificationType, SharedStateSelectionType} from '_types/types';

interface IMessages {
    countValid: number;
    errors: {[x: string]: string[]};
}

interface ISelectionActionsProps {
    parent: ITreeContentRecordAndChildren;
    depth: number;
}

function SelectionActions({parent, depth}: ISelectionActionsProps): JSX.Element {
    const {t} = useTranslation();

    const {selectionState, navigation} = useAppSelector(state => ({
        selectionState: state.selection,
        navigation: state.navigation
    }));
    const dispatch = useAppDispatch();

    const [activeTree] = useActiveTree();

    const [detachFromTree] = useMutation<REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables>(removeTreeElementMutation);
    const [addToTree] = useMutation<ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables>(addTreeElementMutation);
    const [moveInTree] = useMutation<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>(moveTreeElementMutation);
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const displayMessages = (tMessageSuccess: string, tMessageFail: string, messages: IMessages) => {
        if (messages.countValid) {
            const notification: INotification = {
                channel: NotificationChannel.trigger,
                type: NotificationType.success,
                content: t(tMessageSuccess, {
                    nb: messages.countValid
                })
            };

            dispatch(addNotification(notification));
        }

        delete messages.countValid;
        const errors = Object.keys(messages.errors);

        for (const error of errors) {
            const notification: INotification = {
                channel: NotificationChannel.trigger,
                type: NotificationType.warning,
                content: t(tMessageFail, {
                    elements: (messages.errors[error] as string[]).reduce(
                        (acc, elementLabel) => (acc ? `${acc}, ${elementLabel}` : `${elementLabel}`),
                        ''
                    ),
                    errorMessage: error
                })
            };

            dispatch(addNotification(notification));
        }
    };

    const _handleAddElements = async () => {
        if (selectionState.selection.selected.length) {
            let messages: IMessages = {
                countValid: 0,
                errors: {}
            };

            const parentElement = parent.id ?? null;

            for (const elementSelected of selectionState.selection.selected) {
                const treeElement: TreeElementInput = {
                    id: elementSelected.id,
                    library: elementSelected.library
                };
                try {
                    await addToTree({
                        variables: {
                            treeId: activeTree.id,
                            element: treeElement,
                            parent: parentElement
                        }
                    });
                    messages = {...messages, countValid: messages.countValid + 1};
                } catch (e) {
                    if (e.graphQLErrors && e.graphQLErrors.length) {
                        const errorMessageParent = e.graphQLErrors[0].extensions.fields?.parent;
                        const errorMessageElement = e.graphQLErrors[0].extensions.fields?.element;

                        if (errorMessageParent) {
                            messages.errors[errorMessageParent] = [
                                ...(messages.errors[errorMessageParent] ?? []),
                                elementSelected.id
                            ];
                        }
                        if (errorMessageElement) {
                            messages.errors[errorMessageElement] = [
                                ...(messages.errors[errorMessageElement] ?? []),
                                elementSelected.label || elementSelected.id
                            ];
                        }
                    }
                }
            }

            displayMessages('navigation.notifications.success-add', 'navigation.notifications.error-add', messages);
            refreshTreeContent();
        } else {
            const notification: INotification = {
                channel: NotificationChannel.trigger,
                type: NotificationType.warning,
                content: t('navigation.notifications.warning-add-no-selection')
            };

            dispatch(addNotification(notification));
        }

        dispatch(resetSelection());
    };

    const _handleMoveEnd = async () => {
        const messages: IMessages = {
            countValid: 0,
            errors: {}
        };

        const parentTo = parent?.id ?? null;

        for (const elementSelected of selectionState.selection.selected) {
            try {
                await moveInTree({
                    variables: {
                        treeId: activeTree.id,
                        nodeId: elementSelected.nodeId,
                        parentTo
                    }
                });
                messages.countValid++;
            } catch (e) {
                if (e.graphQLErrors && e.graphQLErrors.length) {
                    const errorMessageParent = e.graphQLErrors[0].extensions.fields?.parent;
                    const errorMessageElement = e.graphQLErrors[0].extensions.fields?.element;

                    if (errorMessageParent) {
                        messages.errors[errorMessageParent] = [
                            ...(messages.errors[errorMessageParent] ?? []),
                            elementSelected.id
                        ];
                    }
                    if (errorMessageElement) {
                        messages.errors[errorMessageElement] = [
                            ...(messages.errors[errorMessageElement] ?? []),
                            elementSelected.label || elementSelected.id
                        ];
                    }
                }
            }
        }

        refreshTreeContent();
        displayMessages('navigation.notifications.success-move', 'navigation.notifications.error-move', messages);
        dispatch(resetSelection());
    };

    const _handleDetachElements = async () => {
        if (selectionState.selection.type === SharedStateSelectionType.navigation) {
            const messages: IMessages = {
                countValid: 0,
                errors: {}
            };
            const deletedNodes = [];

            for (const elementSelected of selectionState.selection.selected) {
                try {
                    await detachFromTree({
                        variables: {
                            treeId: activeTree.id,
                            nodeId: elementSelected.nodeId
                        }
                    });

                    messages.countValid++;
                    deletedNodes.push(elementSelected.nodeId);
                } catch (e) {
                    if (e.graphQLErrors && e.graphQLErrors.length) {
                        const errorMessageParent = e.graphQLErrors[0].extensions.fields?.parent;
                        const errorMessageElement = e.graphQLErrors[0].extensions.fields?.element;

                        if (errorMessageParent) {
                            messages.errors[errorMessageParent] = [
                                ...(messages.errors[errorMessageParent] ?? []),
                                elementSelected.id
                            ];
                        }
                        if (errorMessageElement) {
                            messages.errors[errorMessageElement] = [
                                ...(messages.errors[errorMessageElement] ?? []),
                                elementSelected.label || elementSelected.id
                            ];
                        }
                    }
                }
            }

            refreshTreeContent();
            displayMessages(
                'navigation.notifications.success-detach',
                'navigation.notifications.error-detach',
                messages
            );

            dispatch(resetSelection());
            const newPath = navigation.path.filter(p => !deletedNodes.includes(p.id));
            dispatch(setNavigationPath(newPath));
        }
    };

    const searchIsNavigation = selectionState.selection.type === SharedStateSelectionType.navigation;

    const columnIsParent =
        selectionState.selection.type === SharedStateSelectionType.navigation &&
        selectionState.selection.parent === parent?.id;

    const canEditChildren = parent ? parent.permissions.edit_children : activeTree.permissions.edit_children;

    if (selectionState.selection.selected.length) {
        return (
            <>
                {!columnIsParent && canEditChildren && (
                    <StandardBtn
                        icon={<PlusOutlined />}
                        onClick={_handleAddElements}
                        aria-label="add-selection"
                        title={t('navigation.actions.add-selected')}
                    />
                )}

                {searchIsNavigation && canEditChildren && !columnIsParent && (
                    <StandardBtn
                        onClick={_handleMoveEnd}
                        icon={<ArrowDownOutlined />}
                        aria-label="move-selection"
                        title={t('navigation.actions.move-selected')}
                    />
                )}

                {searchIsNavigation && (
                    <StandardBtn
                        onClick={_handleDetachElements}
                        aria-label="detach-selection"
                        icon={<DeleteOutlined />}
                        title={t('navigation.actions.detach-selected')}
                    />
                )}
            </>
        );
    }
    return <></>;
}

export default SelectionActions;
