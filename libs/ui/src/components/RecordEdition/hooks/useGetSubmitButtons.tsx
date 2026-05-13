import {KitButton} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type PossibleSubmitButtons, type SubmitButtonsName} from '../_types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPenToSquare, faCheck, faXmark} from '@fortawesome/free-solid-svg-icons';
import {EDIT_OR_CREATE_RECORD_FORM_ID} from '../EditRecordContent/formConstants';

export const useGetSubmitButtons = (
    buttons: PossibleSubmitButtons,
    id: string,
    isInCreateMode: boolean,
    onClickSubmit: (button: SubmitButtonsName) => void,
    onClickCloseCancel?: () => void,
) => {
    const {t} = useSharedTranslation();
    const headerSubmitButtons = [];

    if (!isInCreateMode) {
        return [];
    }

    if (buttons.includes('closeCancel') && onClickCloseCancel) {
        const closeButtonLabel = isInCreateMode ? t('global.cancel') : t('global.close');
        headerSubmitButtons.push(
            <KitButton
                key="close"
                type="secondary"
                icon={<FontAwesomeIcon icon={faXmark} />}
                onClick={() => onClickCloseCancel?.()}
                size="m"
            >
                {closeButtonLabel}
            </KitButton>,
        );
    }

    if (buttons.includes('create')) {
        headerSubmitButtons.push(
            <KitButton
                key="create"
                form={id ?? EDIT_OR_CREATE_RECORD_FORM_ID}
                type={!buttons.includes('createAndEdit') ? 'primary' : 'secondary'}
                htmlType="submit"
                icon={<FontAwesomeIcon icon={faCheck} />}
                onClick={() => onClickSubmit('create')}
                size="m"
            >
                {t('record_edition.create')}
            </KitButton>,
        );
    }

    if (buttons.includes('createAndEdit')) {
        headerSubmitButtons.push(
            <KitButton
                key="createAndEdit"
                form={id ?? EDIT_OR_CREATE_RECORD_FORM_ID}
                type="primary"
                htmlType="submit"
                icon={<FontAwesomeIcon icon={faPenToSquare} />}
                onClick={() => onClickSubmit('createAndEdit')}
                size="m"
            >
                {t('record_edition.create_and_edit')}
            </KitButton>,
        );
    }

    return headerSubmitButtons;
};
