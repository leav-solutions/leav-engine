// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Modal} from 'semantic-ui-react';
import styled from 'styled-components';
import EditAttribute from '../EditAttribute';
import {OnAttributePostSaveFunc} from '../EditAttribute/EditAttribute';

const GridContent = styled(Modal.Content)`
    &&& {
        display: grid;
    }
`;

interface IEditAttributeModalProps {
    attribute: string;
    open: boolean;
    onClose: () => void;
    onPostSave?: OnAttributePostSaveFunc;
}

function EditAttributeModal({attribute, open, onClose, onPostSave}: IEditAttributeModalProps): JSX.Element {
    const {t} = useTranslation();

    return (
        <Modal
            open={open}
            size="fullscreen"
            centered
            closeOnDimmerClick
            closeOnEscape
            closeIcon
            dimmer
            className="overlay"
            onClose={onClose}
        >
            <GridContent scrolling>
                <EditAttribute attributeId={attribute} onPostSave={onPostSave} />
            </GridContent>
        </Modal>
    );
}

export default EditAttributeModal;
