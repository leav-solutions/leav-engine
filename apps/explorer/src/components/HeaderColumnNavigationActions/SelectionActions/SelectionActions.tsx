// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ArrowDownOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {StandardBtn} from 'components/app/StyledComponent/StandardBtn';
import {useStateNavigation} from 'Context/StateNavigationContext';
import {addTreeElementMutation} from 'graphQL/mutations/trees/addTreeElementMutation';
import {moveTreeElementMutation} from 'graphQL/mutations/trees/moveTreeElementMutation';
import {removeTreeElementMutation} from 'graphQL/mutations/trees/removeTreeElementMutation';
import {getTreeContentQuery} from 'graphQL/queries/trees/getTreeContentQuery';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import {useNotifications} from 'hooks/NotificationsHook/NotificationsHook';
import {resetSharedSelection} from 'hooks/SharedStateHook/SharedReducerActions';
import useStateShared from 'hooks/SharedStateHook/SharedReducerHook';
import {SharedStateSelectionType} from 'hooks/SharedStateHook/SharedStateReducer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {setRefetchTreeData} from 'Reducer/NavigationReducerActions';
import {ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables} from '_gqlTypes/ADD_TREE_ELEMENT';
import {TreeElementInput} from '_gqlTypes/globalTypes';
import {MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables} from '_gqlTypes/MOVE_TREE_ELEMENT';
import {REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables} from '_gqlTypes/REMOVE_TREE_ELEMENT';
import {INavigationPath, NotificationChannel, NotificationType} from '_types/types';

interface IMessages {
    countValid: number;
    errors: {[x: string]: string[]};
}

interface ISelectionActionsProps {
    parent: INavigationPath;
    depth: number;
}

function SelectionActions({parent, depth}: ISelectionActionsProps): JSX.Element {
    const {t} = useTranslation();
    const {stateShared, dispatchShared} = useStateShared();
    const {dispatchNavigation} = useStateNavigation();
    const [activeTree] = useActiveTree();

    const {addNotification} = useNotifications();

    const [removeFromTree] = useMutation<REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables>(removeTreeElementMutation, {
        refetchQueries: [{query: getTreeContentQuery(depth), variables: {treeId: activeTree?.id}}]
    });
    const [addToTree] = useMutation<ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables>(addTreeElementMutation);
    const [moveInTree] = useMutation<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>(moveTreeElementMutation);

    const displayMessages = (tMessageSuccess: string, tMessageFail: string, messages: IMessages) => {
        if (messages.countValid) {
            addNotification({
                channel: NotificationChannel.trigger,
                type: NotificationType.success,
                content: t(tMessageSuccess, {
                    nb: messages.countValid
                })
            });
        }

        delete messages.countValid;
        const errors = Object.keys(messages.errors);

        for (const error of errors) {
            addNotification({
                channel: NotificationChannel.trigger,
                type: NotificationType.warning,
                content: t(tMessageFail, {
                    elements: (messages.errors[error] as string[]).reduce(
                        (acc, elementLabel) => (acc ? `${acc}, ${elementLabel}` : `${elementLabel}`),
                        ''
                    ),
                    errorMessage: error
                })
            });
        }
    };

    const handleAddElements = async () => {
        if (stateShared.selection.selected.length) {
            let messages: IMessages = {
                countValid: 0,
                errors: {}
            };

            const parentElement = parent?.id
                ? {
                      id: parent.id,
                      library: parent.library
                  }
                : null;

            for (const elementSelected of stateShared.selection.selected) {
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
        let messages: IMessages = {
            countValid: 0,
            errors: {}
        };

        const parentTo = parent?.id
            ? {
                  id: parent.id,
                  library: parent.library
              }
            : null;

        for (const elementSelected of stateShared.selection.selected) {
            const treeElement: TreeElementInput = {
                id: elementSelected.id,
                library: elementSelected.library
            };

            try {
                await moveInTree({
                    variables: {
                        treeId: activeTree.id,
                        element: treeElement,
                        parentTo
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

            displayMessages('navigation.notifications.success-move', 'navigation.notifications.error-move', messages);
        }

        dispatchShared(resetSharedSelection());
        dispatchNavigation(setRefetchTreeData(true));
    };

    const handleDeleteElements = async () => {
        if (stateShared.selection.type === SharedStateSelectionType.navigation) {
            let messages: IMessages = {
                countValid: 0,
                errors: {}
            };

            for (const elementSelected of stateShared.selection.selected) {
                const treeElement: TreeElementInput = {
                    id: elementSelected.id,
                    library: elementSelected.library
                };
                try {
                    await removeFromTree({
                        variables: {
                            treeId: activeTree.id,
                            element: treeElement
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

            displayMessages(
                'navigation.notifications.success-detach',
                'navigation.notifications.error-detach',
                messages
            );

            dispatchShared(resetSharedSelection());
            dispatchNavigation(setRefetchTreeData(true));
        }
    };

    if (stateShared.selection.selected.length) {
        return (
            <>
                <span role="button-add-tree-element-button">
                    <StandardBtn icon={<PlusOutlined />} onClick={handleAddElements} />
                </span>
                {stateShared.selection.type === SharedStateSelectionType.navigation && (
                    <>
                        <span role="button-move-selected">
                            <StandardBtn
                                onClick={handleMoveEnd}
                                icon={<ArrowDownOutlined />}
                                title={t('navigation.actions.move-selected')}
                            />
                        </span>
                        <span role="button-detach-selected">
                            <StandardBtn
                                onClick={handleDeleteElements}
                                icon={<DeleteOutlined />}
                                title={t('navigation.actions.detach-selected')}
                            />
                        </span>
                    </>
                )}
            </>
        );
    }
    return <></>;
}

export default SelectionActions;
