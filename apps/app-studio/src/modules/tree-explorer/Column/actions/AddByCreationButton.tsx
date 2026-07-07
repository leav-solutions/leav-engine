import {type FunctionComponent, useState} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {EditRecordModal, type IRecordIdentityWhoAmI, useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {Button, Dropdown, message, Tooltip} from 'antd';
import {useTranslation} from 'react-i18next';
import {useAddTreeElementMutation} from '../../../../__generated__';
import {type IMessages, type ITreeExplorerNode, type ITreeMutationError, type OnMessagesFunc} from '../../_types';
import {type ITreeAllowedChildLibrary} from '../../hooks/useTreeLibraryAllowedAsChild';
import {useRefreshTreeContent} from '../../hooks/useRefreshTreeContent';
import {useTreeExplorerState} from '../../store/useTreeExplorerState';

interface IAddByCreationButtonProps {
    availableLibraries: ITreeAllowedChildLibrary[];
    parent?: ITreeExplorerNode;
    onMessages: OnMessagesFunc;
}

export const AddByCreationButton: FunctionComponent<IAddByCreationButtonProps> = ({
    availableLibraries,
    parent,
    onMessages,
}) => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {activeTree} = useTreeExplorerState();
    const [addToTree] = useAddTreeElementMutation();
    const {refreshTreeContent} = useRefreshTreeContent(activeTree.id);

    const [createRecordLibraryId, setCreateRecordLibrary] = useState<string>();
    const [isCreateRecordModalVisible, setIsCreateRecordModalVisible] = useState(false);

    const _handleOpenCreateRecordModal = (library: string) => () => {
        setIsCreateRecordModalVisible(true);
        setCreateRecordLibrary(library);
    };
    const _handleCloseCreateRecordModal = () => setIsCreateRecordModalVisible(false);

    const _handleCreateRecord = async (newRecord: IRecordIdentityWhoAmI) => {
        let messages: IMessages = {countValid: 0, errors: {}};
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
        } catch (err) {
            const {graphQLErrors, message: errorMessage} = err as ITreeMutationError;
            if (graphQLErrors && graphQLErrors.length) {
                const errorMessageParent = graphQLErrors[0].extensions?.fields?.parent;
                const errorMessageElement = graphQLErrors[0].extensions?.fields?.element;

                if (errorMessageParent) {
                    messages.errors[errorMessageParent] = [...(messages.errors[errorMessageParent] ?? [])];
                }
                if (errorMessageElement) {
                    messages.errors[errorMessageElement] = [...(messages.errors[errorMessageElement] ?? [])];
                }
            } else {
                message.error(`${errorMessage}`);
            }
        }
        onMessages('tree-explorer.infos.success-add', 'tree-explorer.infos.error-add', messages);

        refreshTreeContent();
        _handleCloseCreateRecordModal();
    };

    if (!availableLibraries.length) {
        return null;
    }

    const buttonIcon = <PlusOutlined />;

    return (
        <>
            {availableLibraries.length > 1 ? (
                <Dropdown
                    menu={{
                        items: availableLibraries.map(library => ({
                            key: library.library.id,
                            onClick: _handleOpenCreateRecordModal(library.library.id),
                            label: localizedTranslation(library.library.label, lang),
                        })),
                    }}
                >
                    <Tooltip title={t('tree-explorer.header.add_by_creation')} placement="top">
                        <Button icon={buttonIcon} />
                    </Tooltip>
                </Dropdown>
            ) : (
                <Tooltip title={t('tree-explorer.header.add_by_creation')} placement="top">
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
};
