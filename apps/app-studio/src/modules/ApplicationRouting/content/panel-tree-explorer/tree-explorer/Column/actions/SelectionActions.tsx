import {type ITreeExplorerNode, type OnMessagesFunc} from '../../_types';
import {useTreeExplorerState} from '../../store/useTreeExplorerState';
import {AddSelectionButton} from './AddSelectionButton';
import {DetachSelectionButton} from './DetachSelectionButton';
import {MoveSelectionButton} from './MoveSelectionButton';

interface ISelectionActionsProps {
    parent?: ITreeExplorerNode;
    allowedChildrenLibraries: string[];
    onMessages: OnMessagesFunc;
}

export const SelectionActions = ({parent, allowedChildrenLibraries, onMessages}: ISelectionActionsProps) => {
    const {activeTree, selection} = useTreeExplorerState();
    const hasSelection = !!selection.selected.length;

    if (!hasSelection) {
        return null;
    }

    const columnIsParent = selection.parent === (parent?.id ?? null);
    const canEditChildren = parent ? parent.permissions.edit_children : activeTree.permissions.edit_children;

    return (
        <>
            {!columnIsParent && canEditChildren && (
                <AddSelectionButton
                    parent={parent}
                    allowedLibraries={allowedChildrenLibraries}
                    onMessages={onMessages}
                />
            )}
            {!columnIsParent && canEditChildren && (
                <MoveSelectionButton
                    parent={parent}
                    allowedLibraries={allowedChildrenLibraries}
                    onMessages={onMessages}
                />
            )}
            <DetachSelectionButton onMessages={onMessages} />
        </>
    );
};
