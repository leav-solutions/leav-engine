import {PlusOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {type IRecordIdentityWhoAmI, useLang, EditRecordModal} from '@leav/ui';
import {Button, Dropdown, Tooltip} from 'antd';
import {addTreeElementMutation} from '../../../../../../../../graphQL/mutations/trees/addTreeElementMutation';
import {useActiveTree} from '../../../../../../../../hooks/useActiveTree';
import useRefreshTreeContent from '../../../../../../../../hooks/useRefreshTreeContent';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {localizedTranslation} from '../../../../../../../../utils';
import {
    type ADD_TREE_ELEMENT,
    type ADD_TREE_ELEMENTVariables,
} from '../../../../../../../../_gqlTypes/ADD_TREE_ELEMENT';
import {type GET_TREE_LIBRARIES_trees_list_libraries} from '../../../../../../../../_gqlTypes/GET_TREE_LIBRARIES';
import {type TREE_NODE_CHILDREN_treeNodeChildren_list} from '../../../../../../../../_gqlTypes/TREE_NODE_CHILDREN';
import {type IInfo, InfoChannel, InfoType} from '../../../../../../../../_types/types';
import {type IMessages, type OnMessagesFunc} from '../../_types';

interface IAddByCreationButtonProps {
    availableLibraries: GET_TREE_LIBRARIES_trees_list_libraries[];
    parent?: TREE_NODE_CHILDREN_treeNodeChildren_list;
    onMessages: OnMessagesFunc;
}

function AddByCreationButton({availableLibraries, parent, onMessages}: IAddByCreationButtonProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const [addToTree] = useMutation<ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables>(addTreeElementMutation);
    const [activeTree] = useActiveTree();

    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const [createRecordLibraryId, setCreateRecordLibrary] = useState<string>();
    const [isCreateRecordModalVisible, setIsCreateRecordModalVisible] = useState(false);

    const _handleOpenCreateRecordModal = (library: string) => () => {
        setIsCreateRecordModalVisible(true);
        setCreateRecordLibrary(library);
    };
    const _handleCloseCreateRecordModal = () => setIsCreateRecordModalVisible(false);

    const _handleCreateRecord = async (newRecord: IRecordIdentityWhoAmI) => {
        let notification: IInfo;
        let messages: IMessages = {
            countValid: 0,
            errors: {},
        };
        try {
            await addToTree({
                variables: {
                    treeId: activeTree.id,
                    element: {
                        id: newRecord.id,
                        library: newRecord.library.id,
                    },
                    parent: parent?.id ?? null,
                },
            });

            messages = {...messages, countValid: 1};

            notification = {
                channel: InfoChannel.TRIGGER,
                type: InfoType.SUCCESS,
                content: t('navigation.notifications.success-add', {nb: 1}),
            };
        } catch (err) {
            if (err.graphQLErrors && err.graphQLErrors.length) {
                const errorMessageParent = err.graphQLErrors[0].extensions.fields?.parent;
                const errorMessageElement = err.graphQLErrors[0].extensions.fields?.element;

                if (errorMessageParent) {
                    messages.errors[errorMessageParent] = [...(messages.errors[errorMessageParent] ?? [])];
                }

                if (errorMessageElement) {
                    messages.errors[errorMessageElement] = [...(messages.errors[errorMessageElement] ?? [])];
                }
            } else {
                notification = {
                    channel: InfoChannel.TRIGGER,
                    type: InfoType.ERROR,
                    content: `${err.message}`,
                };
            }
        }
        onMessages('navigation.infos.success-add', 'navigation.infos.error-add', messages);

        refreshTreeContent();
        _handleCloseCreateRecordModal();
    };

    const buttonIcon = <PlusOutlined />;

    if (!availableLibraries.length) {
        return null;
    }

    return (
        <>
            {availableLibraries.length > 1 ? (
                <Dropdown // Add by creation
                    menu={{
                        items: availableLibraries.map(library => ({
                            key: library.library.id,
                            onClick: _handleOpenCreateRecordModal(library.library.id),
                            label: localizedTranslation(library.library.label, lang),
                        })),
                    }}
                >
                    <Tooltip title={t('navigation.header.add_by_creation')} placement="top">
                        <Button icon={buttonIcon} />
                    </Tooltip>
                </Dropdown>
            ) : (
                <Tooltip title={t('navigation.header.add_by_creation')} placement="top">
                    <Button
                        icon={buttonIcon}
                        aria-label="add-by-creation"
                        onClick={_handleOpenCreateRecordModal(availableLibraries[0]?.library.id ?? null)}
                    />
                </Tooltip>
            )}
            {isCreateRecordModalVisible && (
                <EditRecordModal
                    open={isCreateRecordModalVisible}
                    library={createRecordLibraryId}
                    record={null}
                    onClose={_handleCloseCreateRecordModal}
                    onCreate={_handleCreateRecord}
                />
            )}
        </>
    );
}

export default AddByCreationButton;
