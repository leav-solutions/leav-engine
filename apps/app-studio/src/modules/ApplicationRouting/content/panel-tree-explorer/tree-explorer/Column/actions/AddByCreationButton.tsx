import {useState} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {EditRecordPage, type IRecordIdentityWhoAmI, SUBMIT_BUTTONS_PORTAL, useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {Button, Dropdown, message, Tooltip} from 'antd';
import {KitModal} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {useAddTreeElementMutation} from '../../../../../../../__generated__';
import {type IMessages, type ITreeExplorerNode, type ITreeMutationError, type OnMessagesFunc} from '../../_types';
import {type ITreeAllowedChildLibrary} from '../../hooks/useTreeLibraryAllowedAsChild';
import {useRefreshTreeContent} from '../../hooks/useRefreshTreeContent';
import {useTreeExplorerState} from '../../store/useTreeExplorerState';

const CREATION_POPUP_WIDTH = '656px';
const CREATION_POPUP_HEIGHT = '80vh';

export const AddByCreationButton = ({
    availableLibraries,
    parent,
    onMessages,
}: {
    availableLibraries: ITreeAllowedChildLibrary[];
    parent?: ITreeExplorerNode;
    onMessages: OnMessagesFunc;
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
        onMessages('tree_explorer.infos.success_add', 'tree_explorer.infos.error_add', messages);

        refreshTreeContent();
        _handleCloseCreateRecordModal();
    };

    if (!availableLibraries.length) {
        return null;
    }

    const buttonIcon = <PlusOutlined />;

    const createRecordLibrary = availableLibraries.find(library => library.library.id === createRecordLibraryId);
    const creationPopupTitle = createRecordLibrary
        ? localizedTranslation(createRecordLibrary.library.label, lang)
        : t('tree_explorer.header.add_by_creation');

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
                    <Tooltip title={t('tree_explorer.header.add_by_creation')} placement="top">
                        <Button icon={buttonIcon} />
                    </Tooltip>
                </Dropdown>
            ) : (
                <Tooltip title={t('tree_explorer.header.add_by_creation')} placement="top">
                    <Button
                        icon={buttonIcon}
                        aria-label="add-by-creation"
                        onClick={_handleOpenCreateRecordModal(availableLibraries[0]?.library.id ?? null)}
                    />
                </Tooltip>
            )}
            {isCreateRecordModalVisible && (
                <KitModal
                    isOpen
                    showCloseIcon
                    width={CREATION_POPUP_WIDTH}
                    height={CREATION_POPUP_HEIGHT}
                    title={creationPopupTitle}
                    footer={<div id={SUBMIT_BUTTONS_PORTAL} />}
                    close={_handleCloseCreateRecordModal}
                >
                    <EditRecordPage
                        record={null}
                        library={createRecordLibraryId}
                        showHeader={false}
                        isSubmitButtonsPortal
                        removePadding
                        onCreate={_handleCreateRecord}
                        onClose={_handleCloseCreateRecordModal}
                    />
                </KitModal>
            )}
        </>
    );
};
