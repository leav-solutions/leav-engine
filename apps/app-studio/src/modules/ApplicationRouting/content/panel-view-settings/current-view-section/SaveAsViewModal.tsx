import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {KitButton, KitInput, KitModal} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes, faSave} from '@fortawesome/free-solid-svg-icons';

export const SaveAsViewModal = ({
    isOpen,
    onClose,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
}) => {
    const {t} = useTranslation();
    const [name, setName] = useState('');

    const trimmedName = name.trim();
    const isValid = trimmedName !== '';

    const handleClose = () => {
        setName('');
        onClose();
    };

    const handleSubmit = () => {
        if (!isValid) {
            return;
        }

        onSubmit(trimmedName);
        handleClose();
    };

    return (
        <KitModal
            appElement={document.getElementById('root')}
            title={String(t('view_settings.current_view.save_as_modal_title'))}
            showCloseIcon={false}
            isOpen={isOpen}
            close={handleClose}
            footer={
                <>
                    <KitButton type="secondary" icon={<FontAwesomeIcon icon={faTimes} />} onClick={handleClose}>
                        {t('global.cancel')}
                    </KitButton>
                    <KitButton
                        type="primary"
                        icon={<FontAwesomeIcon icon={faSave} />}
                        disabled={!isValid}
                        onClick={handleSubmit}
                    >
                        {t('view_settings.current_view.save')}
                    </KitButton>
                </>
            }
        >
            <KitInput
                autoFocus
                value={name}
                placeholder={String(t('view_settings.current_view.save_as_modal_placeholder'))}
                onChange={event => setName(event.target.value)}
                onPressEnter={event => {
                    // Prevent the Enter key's default action from re-activating the trigger button:
                    // react-modal synchronously returns focus to it on close, and Enter would otherwise re-open the modal.
                    event.preventDefault();
                    handleSubmit();
                }}
            />
        </KitModal>
    );
};
