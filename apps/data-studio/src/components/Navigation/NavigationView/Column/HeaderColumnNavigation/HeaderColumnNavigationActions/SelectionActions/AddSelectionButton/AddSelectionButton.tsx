// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Button} from 'antd';
import {addTreeElementMutation} from 'graphQL/mutations/trees/addTreeElementMutation';
import {useActiveTree} from 'hooks/useActiveTree';
import useRefreshTreeContent from 'hooks/useRefreshTreeContent';
import {useTranslation} from 'react-i18next';
import {addInfo} from 'reduxStore/infos';
import {resetSelection} from 'reduxStore/selection';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables} from '_gqlTypes/ADD_TREE_ELEMENT';
import {TreeElementInput} from '_gqlTypes/globalTypes';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
import {IInfo, InfoChannel, InfoType, ISharedSelected} from '_types/types';
import {IMessages, OnMessagesFunc} from '../../_types';

interface IAddSelectionButtonProps {
    allowedLibraries: string[];
    parent?: TREE_NODE_CHILDREN_treeNodeChildren_list;
    onMessages?: OnMessagesFunc;
}

function AddSelectionButton({allowedLibraries, parent, onMessages}: IAddSelectionButtonProps): JSX.Element {
    const {t} = useTranslation();

    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection,
        navigation: state.navigation
    }));
    const dispatch = useAppDispatch();

    const [activeTree] = useActiveTree();
    const [addToTree] = useMutation<ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables>(addTreeElementMutation);
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const canAddSelection = selectionState.selection.selected.some((selected: ISharedSelected) =>
        allowedLibraries.includes(selected.library)
    );

    const _handleAddElements = async () => {
        if (selectionState.selection.selected.length) {
            let messages: IMessages = {
                countValid: 0,
                errors: {}
            };

            const parentElement = parent?.id ?? null;
            const selectionToAdd = selectionState.selection.selected.filter((selected: ISharedSelected) =>
                allowedLibraries.includes(selected.library)
            );

            for (const elementSelected of selectionToAdd) {
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

            onMessages('navigation.infos.success-add', 'navigation.infos.error-add', messages);
            refreshTreeContent();
        } else {
            const notification: IInfo = {
                channel: InfoChannel.trigger,
                type: InfoType.warning,
                content: t('navigation.infos.warning-add-no-selection')
            };

            dispatch(addInfo(notification));
        }

        dispatch(resetSelection());
    };

    if (!canAddSelection) {
        return null;
    }

    return (
        <Button
            icon={<PlusOutlined />}
            onClick={_handleAddElements}
            aria-label="add-selection"
            title={t('navigation.actions.add-selected')}
        />
    );
}

export default AddSelectionButton;
