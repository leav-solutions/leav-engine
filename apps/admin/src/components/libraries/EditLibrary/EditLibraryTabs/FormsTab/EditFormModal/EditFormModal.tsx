// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Modal} from 'semantic-ui-react';
import EditForm from '../EditForm';
import {EditFormModalButtonsContext, IEditFormModalButtonsContext} from './EditFormModalButtonsContext';

interface IEditFormModalProps {
    open: boolean;
    onClose: () => void;
    formId: string | null;
    libraryId: string;
    readonly: boolean;
}

function EditFormModal({open, onClose, formId, libraryId, readonly}: IEditFormModalProps): JSX.Element {
    const {t} = useTranslation();
    const [modalButtons, setModalButtons] = useState<IEditFormModalButtonsContext['buttons']>({});

    const setButton = (key: string, button: JSX.Element) => {
        setModalButtons({...modalButtons, [key]: button});
    };

    const removeButton = (key: string) => {
        const newButtons = Object.keys(modalButtons).reduce((acc, cur) => {
            if (cur !== key) {
                acc[cur] = modalButtons[cur];
            }
            return acc;
        }, {});

        setModalButtons(newButtons);
    };

    return (
        <EditFormModalButtonsContext.Provider value={{buttons: modalButtons, setButton, removeButton}}>
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
                <Modal.Content scrolling>
                    <EditForm formId={formId} libraryId={libraryId} readonly={readonly} />
                </Modal.Content>
                <Modal.Actions>
                    <Button className="close-button" onClick={onClose}>
                        <Icon name="cancel" /> {t('admin.close')}
                    </Button>
                    {Object.values(modalButtons)}
                </Modal.Actions>
            </Modal>
        </EditFormModalButtonsContext.Provider>
    );
}

export default EditFormModal;
