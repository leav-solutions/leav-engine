// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ArrowDownOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Button} from 'antd';
import {moveTreeElementMutation} from 'graphQL/mutations/trees/moveTreeElementMutation';
import {useActiveTree} from 'hooks/useActiveTree';
import useRefreshTreeContent from 'hooks/useRefreshTreeContent';
import {useTranslation} from 'react-i18next';
import {resetSelection} from 'reduxStore/selection';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables} from '_gqlTypes/MOVE_TREE_ELEMENT';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
import {ISharedSelected} from '_types/types';
import {IMessages, OnMessagesFunc} from '../../_types';

interface IMoveSelectionButtonProps {
    allowedLibraries: string[];
    parent?: TREE_NODE_CHILDREN_treeNodeChildren_list;
    onMessages?: OnMessagesFunc;
}

function MoveSelectionButton({allowedLibraries, parent, onMessages}: IMoveSelectionButtonProps): JSX.Element {
    const {t} = useTranslation();

    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection,
        navigation: state.navigation
    }));
    const dispatch = useAppDispatch();

    const [activeTree] = useActiveTree();
    const [moveInTree] = useMutation<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>(moveTreeElementMutation);
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const canMoveSelection = selectionState.selection.selected.some((selected: ISharedSelected) =>
        allowedLibraries.includes(selected.library)
    );

    const _handleMoveEnd = async () => {
        const messages: IMessages = {
            countValid: 0,
            errors: {}
        };

        const parentTo = parent?.id ?? null;

        const selectionToMove = selectionState.selection.selected.filter((selected: ISharedSelected) =>
            allowedLibraries.includes(selected.library)
        );

        for (const elementSelected of selectionToMove) {
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
        onMessages('navigation.notifications.success-move', 'navigation.notifications.error-move', messages);
        dispatch(resetSelection());
    };

    if (!canMoveSelection) {
        return null;
    }

    return (
        <Button
            onClick={_handleMoveEnd}
            icon={<ArrowDownOutlined />}
            aria-label="move-selection"
            title={t('navigation.actions.move-selected')}
        />
    );
}

export default MoveSelectionButton;
