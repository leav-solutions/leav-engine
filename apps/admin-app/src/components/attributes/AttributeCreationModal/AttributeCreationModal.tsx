// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Modal} from 'semantic-ui-react';
import {GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {AttributeType} from '../../../_gqlTypes/globalTypes';
import EditAttribute from '../EditAttribute';

interface IAttributeCreationModalProps {
    open: boolean;
    onPostSave: (fieldToAdd: GET_ATTRIBUTE_BY_ID_attributes_list) => void;
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
