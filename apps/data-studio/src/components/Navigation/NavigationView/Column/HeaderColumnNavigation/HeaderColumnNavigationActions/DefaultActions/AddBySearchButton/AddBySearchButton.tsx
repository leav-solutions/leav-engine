// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {useLang} from '@leav/ui';
import {Button, Dropdown, Tooltip} from 'antd';
import SearchModal from 'components/SearchModal';
import {addTreeElementMutation} from 'graphQL/mutations/trees/addTreeElementMutation';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import useRefreshTreeContent from 'hooks/useRefreshTreeContent';
import {CSSProperties, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {GrSearchAdvanced} from 'react-icons/gr';
import {addInfo} from 'reduxStore/infos';
import {useAppDispatch} from 'reduxStore/store';
import {localizedTranslation} from 'utils';
import {ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables} from '_gqlTypes/ADD_TREE_ELEMENT';
import {GET_TREE_LIBRARIES_trees_list_libraries} from '_gqlTypes/GET_TREE_LIBRARIES';
import {TreeElementInput} from '_gqlTypes/globalTypes';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
import {InfoChannel, InfoType, ISharedStateSelectionSearch} from '_types/types';
import {IMessages} from '../../_types';

interface IAddBySearchButtonProps {
    availableLibraries: GET_TREE_LIBRARIES_trees_list_libraries[];
    parent?: TREE_NODE_CHILDREN_treeNodeChildren_list;
    onMessages?: (tMessageSuccess: string, tMessageFail: string, messages: IMessages) => void;
}

function AddBySearchButton({availableLibraries, parent, onMessages}: IAddBySearchButtonProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchModalLibraryId, setSearchModalLibraryId] = useState<string>();
    const [activeTree] = useActiveTree();
    const dispatch = useAppDispatch();
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const [addToTree] = useMutation<ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables>(addTreeElementMutation);

    const _showSearch = (selectedLibraryId: string) => {
        setSearchModalLibraryId(selectedLibraryId);
        setSearchModalVisible(true);
    };

    const _handleSubmitAddBySearch = async (selection: ISharedStateSelectionSearch) => {
        if (selection.selected.length) {
            let messages: IMessages = {
                countValid: 0,
                errors: {}
            };

            for (const elementSelected of selection.selected) {
                const treeElement: TreeElementInput = {
                    id: elementSelected.id,
                    library: elementSelected.library
                };
                try {
                    await addToTree({
                        variables: {
                            treeId: activeTree.id,
                            element: treeElement,
                            parent: parent?.id ?? null
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
                    } else {
                        dispatch(
                            addInfo({
                                channel: InfoChannel.trigger,
                                type: InfoType.error,
                                content: `${t('error.error_occurred')}: ${e.message}`
                            })
                        );
                    }
                }
            }

            onMessages('navigation.infos.success-add', 'navigation.infos.error-add', messages);

            refreshTreeContent();
        }
    };

    const buttonIcon = <GrSearchAdvanced size="1.2em" />;
    const buttonStyle: CSSProperties = {
        paddingTop: '5px'
    };

    if (!availableLibraries.length) {
        return null;
    }

    return (
        <>
            {availableLibraries.length > 1 ? (
                <Dropdown // Add by search
                    menu={{
                        items: availableLibraries.map(library => ({
                            key: library.library.id,
                            onClick: () => _showSearch(library.library.id),
                            label: localizedTranslation(library.library.label, lang)
                        }))
                    }}
                >
                    <Tooltip title={t('navigation.header.add_by_search')} placement="top">
                        <Button icon={buttonIcon} style={buttonStyle} />
                    </Tooltip>
                </Dropdown>
            ) : (
                <Tooltip title={t('navigation.header.add_by_search')} placement="top">
                    <Button
                        icon={buttonIcon}
                        aria-label="add-by-search"
                        onClick={() => _showSearch(availableLibraries[0]?.library.id ?? null)}
                        style={buttonStyle}
                    />
                </Tooltip>
            )}
            {searchModalVisible && (
                <SearchModal
                    visible={searchModalVisible}
                    setVisible={setSearchModalVisible}
                    submitAction={_handleSubmitAddBySearch}
                    libId={searchModalLibraryId}
                />
            )}
        </>
    );
}

export default AddBySearchButton;
