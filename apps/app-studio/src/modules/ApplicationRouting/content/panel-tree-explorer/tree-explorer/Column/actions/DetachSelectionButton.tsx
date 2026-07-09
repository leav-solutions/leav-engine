import {DeleteOutlined} from '@ant-design/icons';
import {useConfirmModal} from '@leav/ui';
import {Button} from 'antd';
import {useTranslation} from 'react-i18next';
import {useRemoveTreeElementMutation} from '../../../../../../../__generated__';
import {type IMessages, type ITreeMutationError, type OnMessagesFunc} from '../../_types';
import {useRefreshTreeContent} from '../../hooks/useRefreshTreeContent';
import {useTreeExplorerState} from '../../store/useTreeExplorerState';
import {withTreeMutationError} from '../../utils';

interface IDetachSelectionButtonProps {
    onMessages: OnMessagesFunc;
}

export const DetachSelectionButton = ({onMessages}: IDetachSelectionButtonProps) => {
    const {t} = useTranslation();
    const {activeTree, path, selection, setPath, resetSelection} = useTreeExplorerState();
    const [detachFromTree] = useRemoveTreeElementMutation();
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);
    const {openConfirmModal} = useConfirmModal();

    const _handleDetachElements = async () => {
        let messages: IMessages = {countValid: 0, errors: {}};
        const deletedNodes: string[] = [];

        for (const elementSelected of selection.selected) {
            try {
                await detachFromTree({
                    variables: {
                        treeId: activeTree.id,
                        nodeId: elementSelected.nodeId,
                    },
                });

                messages.countValid++;
                deletedNodes.push(elementSelected.nodeId);
            } catch (e) {
                messages = withTreeMutationError(messages, e as ITreeMutationError, elementSelected);
            }
        }

        refreshTreeContent();
        onMessages('tree_explorer.infos.success_detach', 'tree_explorer.infos.error_detach', messages);

        resetSelection();
        setPath(path.filter(p => !deletedNodes.includes(p.id)));
    };

    const _handleClickDetach = () => {
        openConfirmModal({
            title: t('tree_explorer.confirm.detach_selection_title'),
            content: t('tree_explorer.confirm.detach_selection_content', {count: selection.selected.length}),
            dangerConfirm: true,
            onOk: _handleDetachElements,
        });
    };

    return (
        <Button
            onClick={_handleClickDetach}
            aria-label="detach-selection"
            icon={<DeleteOutlined />}
            title={t('tree_explorer.actions.detach_selected')}
        />
    );
};
