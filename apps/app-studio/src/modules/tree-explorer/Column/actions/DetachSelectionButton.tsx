import {type FunctionComponent} from 'react';
import {DeleteOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import {useTranslation} from 'react-i18next';
import {useRemoveTreeElementMutation} from '../../../../__generated__';
import {type IMessages, type ITreeMutationError, type OnMessagesFunc} from '../../_types';
import {useRefreshTreeContent} from '../../hooks/useRefreshTreeContent';
import {useTreeExplorerState} from '../../store/useTreeExplorerState';

interface IDetachSelectionButtonProps {
    onMessages: OnMessagesFunc;
}

export const DetachSelectionButton: FunctionComponent<IDetachSelectionButtonProps> = ({onMessages}) => {
    const {t} = useTranslation();
    const {activeTree, path, selection, setPath, resetSelection} = useTreeExplorerState();
    const [detachFromTree] = useRemoveTreeElementMutation();
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const _handleDetachElements = async () => {
        const messages: IMessages = {countValid: 0, errors: {}};
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
                const {graphQLErrors} = e as ITreeMutationError;
                if (graphQLErrors && graphQLErrors.length) {
                    const errorMessageParent = graphQLErrors[0].extensions?.fields?.parent;
                    const errorMessageElement = graphQLErrors[0].extensions?.fields?.element;

                    if (errorMessageParent) {
                        messages.errors[errorMessageParent] = [
                            ...(messages.errors[errorMessageParent] ?? []),
                            elementSelected.id,
                        ];
                    }
                    if (errorMessageElement) {
                        messages.errors[errorMessageElement] = [
                            ...(messages.errors[errorMessageElement] ?? []),
                            elementSelected.label || elementSelected.id,
                        ];
                    }
                }
            }
        }

        refreshTreeContent();
        onMessages('tree-explorer.infos.success-detach', 'tree-explorer.infos.error-detach', messages);

        resetSelection();
        setPath(path.filter(p => !deletedNodes.includes(p.id)));
    };

    return (
        <Button
            onClick={_handleDetachElements}
            aria-label="detach-selection"
            icon={<DeleteOutlined />}
            title={t('tree-explorer.actions.detach-selected')}
        />
    );
};
