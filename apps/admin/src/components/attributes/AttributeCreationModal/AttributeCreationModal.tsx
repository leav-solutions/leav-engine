// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Modal} from 'semantic-ui-react';
import {AttributeType} from '../../../_gqlTypes/globalTypes';
import EditAttribute from '../EditAttribute';
import {OnAttributePostSaveFunc} from '../EditAttribute/EditAttribute';

interface IAttributeCreationModalProps {
    open: boolean;
    onPostSave: OnAttributePostSaveFunc;
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
