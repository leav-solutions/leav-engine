// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Modal} from 'semantic-ui-react';
import EditForm from '../EditForm';

interface IEditFormModalProps {
    open: boolean;
    onClose: () => void;
    formId: string | null;
    libraryId: string;
}

function EditFormModal({open, onClose, formId, libraryId}: IEditFormModalProps): JSX.Element {
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
            onClose={onClose}
            className="overlay"
        >
            <Modal.Content scrolling>
                <EditForm formId={formId} libraryId={libraryId} />
            </Modal.Content>
            <Modal.Actions>
                <Button className="close-button" onClick={onClose} negative>
                    <Icon name="cancel" /> {t('admin.cancel')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default EditFormModal;
