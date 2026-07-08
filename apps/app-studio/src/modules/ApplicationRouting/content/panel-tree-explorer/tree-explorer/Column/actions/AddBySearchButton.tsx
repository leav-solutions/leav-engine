import {type CSSProperties, useState} from 'react';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {type ISearchSelection, SearchModal, useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {Button, Dropdown, message, Tooltip} from 'antd';
import {useTranslation} from 'react-i18next';
import {type TreeElementInput, useAddTreeElementMutation} from '../../../../../../../__generated__';
import {type IMessages, type ITreeExplorerNode, type ITreeMutationError, type OnMessagesFunc} from '../../_types';
import {type ITreeAllowedChildLibrary} from '../../hooks/useTreeLibraryAllowedAsChild';
import {useRefreshTreeContent} from '../../hooks/useRefreshTreeContent';
import {useTreeExplorerState} from '../../store/useTreeExplorerState';
import {withTreeMutationError} from '../../utils';

interface IAddBySearchButtonProps {
    availableLibraries: ITreeAllowedChildLibrary[];
    parent?: ITreeExplorerNode;
    onMessages: OnMessagesFunc;
}

export const AddBySearchButton = ({availableLibraries, parent, onMessages}: IAddBySearchButtonProps) => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {activeTree} = useTreeExplorerState();
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchModalLibraryId, setSearchModalLibraryId] = useState<string>();
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const [addToTree] = useAddTreeElementMutation();

    const _showSearch = (selectedLibraryId: string) => {
        setSearchModalLibraryId(selectedLibraryId);
        setSearchModalVisible(true);
    };

    const _handleSubmitAddBySearch = async (selection: ISearchSelection) => {
        if (!selection.selected.length) {
            return;
        }

        let messages: IMessages = {countValid: 0, errors: {}};

        for (const elementSelected of selection.selected) {
            const treeElement: TreeElementInput = {
                id: elementSelected.id,
                library: elementSelected.library,
            };
            try {
                await addToTree({
                    variables: {
                        treeId: activeTree.id,
                        element: treeElement,
                        parent: parent?.id ?? null,
                    },
                });

                messages = {...messages, countValid: messages.countValid + 1};
            } catch (e) {
                const error = e as ITreeMutationError;
                if (error.graphQLErrors?.length) {
                    messages = withTreeMutationError(messages, error, elementSelected);
                } else {
                    message.error(`${error.message}`);
                }
            }
        }

        onMessages('tree_explorer.infos.success_add', 'tree_explorer.infos.error_add', messages);
        refreshTreeContent();
    };

    if (!availableLibraries.length) {
        return null;
    }

    const buttonIcon = <FontAwesomeIcon icon={faMagnifyingGlass} />;
    const buttonStyle: CSSProperties = {paddingTop: '5px'};

    return (
        <>
            {availableLibraries.length > 1 ? (
                <Dropdown
                    menu={{
                        items: availableLibraries.map(library => ({
                            key: library.library.id,
                            onClick: () => _showSearch(library.library.id),
                            label: localizedTranslation(library.library.label, lang),
                        })),
                    }}
                >
                    <Tooltip title={t('tree_explorer.header.add_by_search')} placement="top">
                        <Button icon={buttonIcon} style={buttonStyle} />
                    </Tooltip>
                </Dropdown>
            ) : (
                <Tooltip title={t('tree_explorer.header.add_by_search')} placement="top">
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
};
