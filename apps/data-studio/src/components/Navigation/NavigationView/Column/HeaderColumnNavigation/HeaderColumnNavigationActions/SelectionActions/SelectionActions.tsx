// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useActiveTree} from 'hooks/useActiveTree';
import {useAppSelector} from 'reduxStore/store';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
import {SharedStateSelectionType} from '_types/types';
import {OnMessagesFunc} from '../_types';
import AddSelectionButton from './AddSelectionButton';
import DetachSelectionButton from './DetachSelectionButton';
import MoveSelectionButton from './MoveSelectionButton';

interface ISelectionActionsProps {
    parent: TREE_NODE_CHILDREN_treeNodeChildren_list;
    allowedChildrenLibraries: string[];
    onMessages?: OnMessagesFunc;
}

function SelectionActions({parent, allowedChildrenLibraries, onMessages}: ISelectionActionsProps): JSX.Element {
    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection,
        navigation: state.navigation
    }));
    const hasSelection = !!selectionState.selection.selected.length;

    const [activeTree] = useActiveTree();

    const isNavigationSelection = selectionState.selection.type === SharedStateSelectionType.navigation;

    const columnIsParent =
        selectionState.selection.type === SharedStateSelectionType.navigation &&
        selectionState.selection.parent === parent?.id;

    const canEditChildren = parent ? parent.permissions.edit_children : activeTree.permissions.edit_children;

    if (!hasSelection) {
        return null;
    }

    return (
        <>
            {!columnIsParent && canEditChildren && (
                <AddSelectionButton
                    parent={parent}
                    allowedLibraries={allowedChildrenLibraries}
                    onMessages={onMessages}
                />
            )}
            {isNavigationSelection && canEditChildren && !columnIsParent && (
                <MoveSelectionButton
                    parent={parent}
                    allowedLibraries={allowedChildrenLibraries}
                    onMessages={onMessages}
                />
            )}
            {isNavigationSelection && <DetachSelectionButton onMessages={onMessages} />}
        </>
    );
}

export default SelectionActions;
