import {ArrowDownOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import {useTranslation} from 'react-i18next';
import {useMoveTreeElementMutation} from '../../../../../../../__generated__';
import {type IMessages, type ITreeExplorerNode, type ITreeMutationError, type OnMessagesFunc} from '../../_types';
import {useRefreshTreeContent} from '../../hooks/useRefreshTreeContent';
import {useTreeExplorerState} from '../../store/useTreeExplorerState';
import {withTreeMutationError} from '../../utils';

interface IMoveSelectionButtonProps {
    allowedLibraries: string[];
    parent?: ITreeExplorerNode;
    onMessages: OnMessagesFunc;
}

export const MoveSelectionButton = ({allowedLibraries, parent, onMessages}: IMoveSelectionButtonProps) => {
    const {t} = useTranslation();
    const {activeTree, selection, resetSelection} = useTreeExplorerState();
    const [moveInTree] = useMoveTreeElementMutation();
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const canMoveSelection = selection.selected.some(selected => allowedLibraries.includes(selected.library));

    const _handleMoveEnd = async () => {
        let messages: IMessages = {countValid: 0, errors: {}};
        const parentTo = parent?.id ?? null;
        const selectionToMove = selection.selected.filter(selected => allowedLibraries.includes(selected.library));

        for (const elementSelected of selectionToMove) {
            try {
                await moveInTree({
                    variables: {
                        treeId: activeTree.id,
                        nodeId: elementSelected.nodeId,
                        parentTo,
                    },
                });
                messages.countValid++;
            } catch (e) {
                messages = withTreeMutationError(messages, e as ITreeMutationError, elementSelected);
            }
        }

        refreshTreeContent();
        onMessages('tree_explorer.infos.success_move', 'tree_explorer.infos.error_move', messages);
        resetSelection();
    };

    if (!canMoveSelection) {
        return null;
    }

    return (
        <Button
            onClick={_handleMoveEnd}
            icon={<ArrowDownOutlined />}
            aria-label="move-selection"
            title={t('tree_explorer.actions.move_selected')}
        />
    );
};
