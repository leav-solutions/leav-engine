import {PlusOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import {KitAlert} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {INFO_NOTIFICATION_DURATION} from '_ui/constants';
import {type TreeElementInput, useAddTreeElementMutation} from '../../../../../../../__generated__';
import {type IMessages, type ITreeExplorerNode, type ITreeMutationError, type OnMessagesFunc} from '../../_types';
import {useRefreshTreeContent} from '../../hooks/useRefreshTreeContent';
import {useTreeExplorerState} from '../../store/useTreeExplorerState';
import {withTreeMutationError} from '../../utils';

interface IAddSelectionButtonProps {
    allowedLibraries: string[];
    parent?: ITreeExplorerNode;
    onMessages: OnMessagesFunc;
}

export const AddSelectionButton = ({allowedLibraries, parent, onMessages}: IAddSelectionButtonProps) => {
    const {t} = useTranslation();
    const {activeTree, selection, resetSelection} = useTreeExplorerState();
    const [addToTree] = useAddTreeElementMutation();
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const canAddSelection = selection.selected.some(selected => allowedLibraries.includes(selected.library));

    const _handleAddElements = async () => {
        if (selection.selected.length) {
            let messages: IMessages = {countValid: 0, errors: {}};
            const parentElement = parent?.id ?? null;
            const selectionToAdd = selection.selected.filter(selected => allowedLibraries.includes(selected.library));

            for (const elementSelected of selectionToAdd) {
                const treeElement: TreeElementInput = {
                    id: elementSelected.id,
                    library: elementSelected.library,
                };
                try {
                    await addToTree({
                        variables: {
                            treeId: activeTree.id,
                            element: treeElement,
                            parent: parentElement,
                        },
                    });
                    messages = {...messages, countValid: messages.countValid + 1};
                } catch (e) {
                    messages = withTreeMutationError(messages, e as ITreeMutationError, elementSelected);
                }
            }

            onMessages('tree_explorer.infos.success_add', 'tree_explorer.infos.error_add', messages);
            refreshTreeContent();
        } else {
            KitAlert.warning({
                message: t('tree_explorer.infos.warning_add_no_selection'),
                duration: INFO_NOTIFICATION_DURATION,
                showIcon: true,
            });
        }

        resetSelection();
    };

    if (!canAddSelection) {
        return null;
    }

    return (
        <Button
            icon={<PlusOutlined />}
            onClick={_handleAddElements}
            aria-label="add-selection"
            title={t('tree_explorer.actions.add_selected')}
        />
    );
};
