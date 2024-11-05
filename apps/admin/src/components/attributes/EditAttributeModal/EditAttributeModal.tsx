// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
    redirectAfterCreate?: boolean;
}

function EditAttributeModal({
    attribute,
    open,
    onClose,
    onPostSave,
    redirectAfterCreate
}: IEditAttributeModalProps): JSX.Element {
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
                <EditAttribute
                    attributeId={attribute}
                    onPostSave={onPostSave}
                    redirectAfterCreate={redirectAfterCreate}
                />
            </GridContent>
        </Modal>
    );
}

export default EditAttributeModal;
