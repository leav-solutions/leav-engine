import {type FunctionComponent} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {Button, message} from 'antd';
import {useTranslation} from 'react-i18next';
import {type TreeElementInput, useAddTreeElementMutation} from '../../../../__generated__';
import {type IMessages, type ITreeExplorerNode, type ITreeMutationError, type OnMessagesFunc} from '../../_types';
import {useRefreshTreeContent} from '../../hooks/useRefreshTreeContent';
import {useTreeExplorerState} from '../../store/useTreeExplorerState';

interface IAddSelectionButtonProps {
    allowedLibraries: string[];
    parent?: ITreeExplorerNode;
    onMessages: OnMessagesFunc;
}

export const AddSelectionButton: FunctionComponent<IAddSelectionButtonProps> = ({
    allowedLibraries,
    parent,
    onMessages,
}) => {
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

            onMessages('tree-explorer.infos.success-add', 'tree-explorer.infos.error-add', messages);
            refreshTreeContent();
        } else {
            message.warning(t('tree-explorer.infos.warning-add-no-selection'));
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
            title={t('tree-explorer.actions.add-selected')}
        />
    );
};
