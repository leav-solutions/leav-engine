import {useTranslation} from 'react-i18next';
import {KitButton, KitModal} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSave} from '@fortawesome/free-solid-svg-icons';

export const UnsavedViewChangesModal = ({
    isOpen,
    saveLoading,
    canSave,
    onClose,
    onDiscard,
    onSave,
}: {
    isOpen: boolean;
    saveLoading: boolean;
    canSave: boolean;
    onClose: () => void;
    onDiscard: () => void;
    onSave: () => void;
}) => {
    const {t} = useTranslation();

    return (
        <KitModal
            appElement={document.getElementById('root')}
            title={String(t('view_settings.unsaved-changes.title'))}
            isOpen={isOpen}
            close={onClose}
            footer={
                <>
                    <KitButton type="secondary" danger onClick={onDiscard}>
                        {t('view_settings.unsaved-changes.discard')}
                    </KitButton>
                    <KitButton
                        type="primary"
                        icon={<FontAwesomeIcon icon={faSave} />}
                        disabled={!canSave}
                        loading={saveLoading}
                        onClick={onSave}
                    >
                        {t('view_settings.current-view.save')}
                    </KitButton>
                </>
            }
            showCloseIcon
        >
            {t('view_settings.unsaved-changes.content')}
        </KitModal>
    );
};
