// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Dropdown, Menu} from 'antd';
import {StandardBtn} from 'components/app/StyledComponent/StandardBtn';
import EditRecordModal from 'components/RecordEdition/EditRecordModal';
import {addTreeElementMutation} from 'graphQL/mutations/trees/addTreeElementMutation';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import {useLang} from 'hooks/LangHook/LangHook';
import useRefreshTreeContent from 'hooks/useRefreshTreeContent';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {localizedTranslation} from 'utils';
import {ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables} from '_gqlTypes/ADD_TREE_ELEMENT';
import {GET_TREE_LIBRARIES_trees_list_libraries} from '_gqlTypes/GET_TREE_LIBRARIES';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
import {INotification, NotificationChannel, NotificationType} from '_types/types';
import {IMessages, OnMessagesFunc} from '../../_types';

interface IAddByCreationButtonProps {
    availableLibraries: GET_TREE_LIBRARIES_trees_list_libraries[];
    parent?: TREE_NODE_CHILDREN_treeNodeChildren_list;
    onMessages: OnMessagesFunc;
}

function AddByCreationButton({availableLibraries, parent, onMessages}: IAddByCreationButtonProps): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
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

    const _handleAfterCreateRecord = async (newRecord: RecordIdentity_whoAmI) => {
        let notification: INotification;
        let messages: IMessages = {
            countValid: 0,
            errors: {}
        };
        try {
            await addToTree({
                variables: {
                    treeId: activeTree.id,
                    element: {
                        id: newRecord.id,
                        library: newRecord.library.id
                    },
                    parent: parent?.id ?? null
                }
            });

            messages = {...messages, countValid: 1};

            notification = {
                channel: NotificationChannel.trigger,
                type: NotificationType.success,
                content: t('navigation.notifications.success-add', {nb: 1})
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
                    channel: NotificationChannel.trigger,
                    type: NotificationType.error,
                    content: `${t('error.error_occurred')}: ${err.message}`
                };
            }
        }
        onMessages('navigation.notifications.success-add', 'navigation.notifications.error-add', messages);

        refreshTreeContent();
    };

    const buttonIcon = <PlusOutlined />;

    if (!availableLibraries.length) {
        return null;
    }

    return (
        <>
            {availableLibraries.length > 1 ? (
                <Dropdown // Add by creation
                    overlay={
                        <Menu
                            items={availableLibraries.map(library => ({
                                key: library.library.id,
                                onClick: _handleOpenCreateRecordModal(library.library.id),
                                label: localizedTranslation(library.library.label, lang)
                            }))}
                        ></Menu>
                    }
                >
                    <StandardBtn icon={buttonIcon} />
                </Dropdown>
            ) : (
                <StandardBtn
                    icon={buttonIcon}
                    aria-label="add-by-creation"
                    onClick={_handleOpenCreateRecordModal(availableLibraries[0]?.library.id ?? null)}
                />
            )}
            {isCreateRecordModalVisible && (
                <EditRecordModal
                    open={isCreateRecordModalVisible}
                    library={createRecordLibraryId}
                    record={null}
                    onClose={_handleCloseCreateRecordModal}
                    afterCreate={_handleAfterCreateRecord}
                />
            )}
        </>
    );
}

export default AddByCreationButton;
