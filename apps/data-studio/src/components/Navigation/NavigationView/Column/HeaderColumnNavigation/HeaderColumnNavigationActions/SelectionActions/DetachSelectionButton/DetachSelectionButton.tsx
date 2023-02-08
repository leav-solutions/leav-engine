// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Button} from 'antd';
import {removeTreeElementMutation} from 'graphQL/mutations/trees/removeTreeElementMutation';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import useRefreshTreeContent from 'hooks/useRefreshTreeContent';
import {useTranslation} from 'react-i18next';
import {setNavigationPath} from 'reduxStore/navigation';
import {resetSelection} from 'reduxStore/selection';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables} from '_gqlTypes/REMOVE_TREE_ELEMENT';
import {IMessages, OnMessagesFunc} from '../../_types';

interface IDetachSelectionButtonProps {
    onMessages?: OnMessagesFunc;
}

function DetachSelectionButton({onMessages}: IDetachSelectionButtonProps): JSX.Element {
    const {t} = useTranslation();

    const {selectionState, navigation} = useAppSelector(state => ({
        selectionState: state.selection,
        navigation: state.navigation
    }));
    const dispatch = useAppDispatch();

    const [activeTree] = useActiveTree();

    const [detachFromTree] = useMutation<REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables>(removeTreeElementMutation);
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const _handleDetachElements = async () => {
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
        onMessages('navigation.notifications.success-detach', 'navigation.notifications.error-detach', messages);

        dispatch(resetSelection());
        const newPath = navigation.path.filter(p => !deletedNodes.includes(p.id));
        dispatch(setNavigationPath(newPath));
    };

    return (
        <Button
            onClick={_handleDetachElements}
            aria-label="detach-selection"
            icon={<DeleteOutlined />}
            title={t('navigation.actions.detach-selected')}
        />
    );
}

export default DetachSelectionButton;
