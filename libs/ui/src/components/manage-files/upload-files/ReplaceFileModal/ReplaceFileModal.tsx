import {type FunctionComponent, useEffect, useState} from 'react';
import {faCheck, faClone, faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitButton, KitCheckbox, KitModal, KitSpace, KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FILES_WIZARD_MODAL_WIDTH} from '../../shared/FilesWizardModal';
import {type IReplaceDecision} from '../useCheckFilesExist';

interface IReplaceFileModalProps {
    filename?: string;
    onDecide: (decision: IReplaceDecision) => void;
    onCancel: () => void;
}

/** Asks what to do with a file whose name already exists in the destination directory. */
export const ReplaceFileModal: FunctionComponent<IReplaceFileModalProps> = ({filename, onDecide, onCancel}) => {
    const {t} = useSharedTranslation();
    const [applyToAll, setApplyToAll] = useState(false);

    useEffect(() => setApplyToAll(false), [filename]);

    const _decide = (replace: boolean) => () => onDecide({replace, applyToAll});

    return (
        <KitModal
            appElement={document.getElementById('root')}
            isOpen={!!filename}
            // No close icon: every exit is an explicit footer button, so no answer is ever implicit.
            // `shouldCloseOnOverlayClick` is what makes Escape reach `close` at all (KitModal gates
            // `onRequestClose` on `showCloseIcon || shouldCloseOnOverlayClick`), and cancelling is
            // the only harmless thing a dismissal can mean here.
            close={onCancel}
            shouldCloseOnOverlayClick
            title={t('upload.replace_modal.title')}
            width={FILES_WIZARD_MODAL_WIDTH}
            height="auto"
            testId="replace-file-modal"
            footer={
                <KitSpace>
                    <KitCheckbox checked={applyToAll} onChange={e => setApplyToAll(e.target.checked)}>
                        {t('upload.replace_modal.applyToAll')}
                    </KitCheckbox>
                    <KitButton data-testid="cancel-btn" icon={<FontAwesomeIcon icon={faXmark} />} onClick={onCancel}>
                        {t('global.cancel')}
                    </KitButton>
                    <KitButton
                        data-testid="keep-both-btn"
                        icon={<FontAwesomeIcon icon={faClone} />}
                        onClick={_decide(false)}
                    >
                        {t('upload.replace_modal.keepBtn')}
                    </KitButton>
                    <KitButton
                        data-testid="replace-btn"
                        type="primary"
                        icon={<FontAwesomeIcon icon={faCheck} />}
                        onClick={_decide(true)}
                    >
                        {t('upload.replace_modal.replaceBtn')}
                    </KitButton>
                </KitSpace>
            }
        >
            <KitTypography.Text>{t('upload.replace_modal.message', {filename})}</KitTypography.Text>
        </KitModal>
    );
};
