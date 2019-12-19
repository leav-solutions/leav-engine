import React from 'react';
import {useTranslation} from 'react-i18next';
import {Modal} from 'semantic-ui-react';
import {GET_ATTRIBUTES_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeType} from '../../../_gqlTypes/globalTypes';
import EditAttribute from '../EditAttribute';

interface IAttributeCreationModalProps {
    open: boolean;
    onPostSave: (fieldToAdd: GET_ATTRIBUTES_attributes_list) => void;
    onClose: () => void;
    forcedType?: AttributeType;
}

function AttributeCreationModal({open, onPostSave, onClose, forcedType}: IAttributeCreationModalProps): JSX.Element {
    const {t} = useTranslation();
    return (
        <>
            <Modal size="large" open={open} onClose={onClose} centered closeIcon>
                <Modal.Header>{t('attributes.new')}</Modal.Header>
                <Modal.Content>
                    <EditAttribute attributeId={null} onPostSave={onPostSave} forcedType={forcedType} />
                </Modal.Content>
            </Modal>
        </>
    );
}

export default AttributeCreationModal;
