// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import useMessages from 'hooks/useMessages';
import {saveApiKeyMutation} from 'queries/apiKeys/saveApiKeyMutation';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {MessagesTypes} from 'reduxStore/messages/messages';
import {Button, Icon, Message, Modal} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_API_KEYS_apiKeys_list} from '_gqlTypes/GET_API_KEYS';
import {ApiKeyInput} from '_gqlTypes/globalTypes';
import {SAVE_API_KEY, SAVE_API_KEYVariables} from '_gqlTypes/SAVE_API_KEY';
import EditApiKeyForm from './EditApiKeyForm';

interface IEditApiKeyModalProps {
    apiKey: GET_API_KEYS_apiKeys_list;
    onClose: () => void;
    readonly?: boolean;
}

const CreationDetails = styled.div`
    font-size: 1rem;
    font-weight: normal;
    color: #999;
    display: flex;
    gap: 0.5rem;
`;

const ModalContent = styled(Modal.Content)`
    height: 30rem;
    overflow: auto;
`;

function EditApiKeyModal({apiKey, onClose, readonly}: IEditApiKeyModalProps): JSX.Element {
    const _handleClose = () => onClose();
    const {t} = useTranslation();
    const {addMessage} = useMessages();
    const [saveApiKey, {loading}] = useMutation<SAVE_API_KEY, SAVE_API_KEYVariables>(saveApiKeyMutation);
    const [currentApiKey, setCurrentApiKey] = React.useState<GET_API_KEYS_apiKeys_list>(apiKey);
    const isNewKey = !currentApiKey?.id;

    const _handleFormSubmit = async (apiKeyData: ApiKeyInput) => {
        const saveRes = await saveApiKey({
            variables: {
                apiKey: apiKeyData
            },
            update: cache => {
                // We created a new profile, invalidate all version profiles list cache
                if (isNewKey) {
                    cache.evict({fieldName: 'apiKeys'});
                }
            }
        });

        setCurrentApiKey(saveRes.data.saveApiKey);
    };

    const _handleCopyKey = () => {
        navigator.clipboard.writeText(currentApiKey.key);

        addMessage({
            type: MessagesTypes.SUCCESS,
            content: t('api_keys.copy_success')
        });
    };

    return (
        <Modal size="large" open onClose={_handleClose} centered closeIcon style={{maxHeight: '90vh'}}>
            <Modal.Header>
                {isNewKey ? t('api_keys.new') : currentApiKey.label}
                {!isNewKey && (
                    <CreationDetails>
                        <span>
                            {t('api_keys.creation_details', {
                                date: new Date(currentApiKey.createdAt * 1000).toLocaleString(),
                                user: currentApiKey.user.whoAmI.label,
                                interpolation: {escapeValue: false}
                            })}
                            ,
                        </span>
                        <span>
                            {t('api_keys.modification_details', {
                                date: new Date(currentApiKey.modifiedAt * 1000).toLocaleString(),
                                user: currentApiKey.user.whoAmI.label,
                                interpolation: {escapeValue: false}
                            })}
                        </span>
                    </CreationDetails>
                )}
            </Modal.Header>
            <ModalContent>
                {!isNewKey && currentApiKey.key && (
                    <Message success icon>
                        <Icon name="checkmark" size="big" />
                        <Message.Content>
                            <Message.Header>
                                {t('api_keys.key_display', {key: currentApiKey.key})}
                                <Button
                                    circular
                                    onClick={_handleCopyKey}
                                    icon="copy"
                                    title={t('api_keys.copy_key')}
                                    style={{marginLeft: '1rem'}}
                                />
                            </Message.Header>
                            <Icon name="warning sign" />
                            {t('api_keys.key_display_warning')}
                        </Message.Content>
                    </Message>
                )}
                <EditApiKeyForm
                    apiKey={currentApiKey}
                    onSubmit={_handleFormSubmit}
                    onClose={_handleClose}
                    readonly={readonly}
                    errors={null}
                    loading={loading}
                />
            </ModalContent>
        </Modal>
    );
}

export default EditApiKeyModal;
