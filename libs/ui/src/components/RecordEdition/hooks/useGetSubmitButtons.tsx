import {KitButton} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {possibleSubmitButtons, submitButtonsProp} from '../_types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPenToSquare, faCheck} from '@fortawesome/free-solid-svg-icons';
import {EDIT_OR_CREATE_RECORD_FORM_ID} from '../EditRecordContent/formConstants';

export const useGetSubmitButtons = (
    buttons: submitButtonsProp,
    isInCreateMode: boolean,
    onClickSubmit: (button: possibleSubmitButtons) => void
) => {
    const {t} = useSharedTranslation();
    const headerSubmitButtons = [];

    if (!isInCreateMode) {
        return [];
    }

    if (buttons === 'both' || buttons === 'create') {
        headerSubmitButtons.push(
            <KitButton
                key="create"
                form={EDIT_OR_CREATE_RECORD_FORM_ID}
                type={buttons === 'create' ? 'primary' : 'secondary'}
                htmlType="submit"
                icon={<FontAwesomeIcon icon={faCheck} />}
                onClick={() => onClickSubmit('create')}
            >
                {t('record_edition.create')}
            </KitButton>
        );
    }

    if (buttons === 'both' || buttons === 'createAndEdit') {
        headerSubmitButtons.push(
            <KitButton
                key="createAndEdit"
                form={EDIT_OR_CREATE_RECORD_FORM_ID}
                type="primary"
                htmlType="submit"
                icon={<FontAwesomeIcon icon={faPenToSquare} />}
                onClick={() => onClickSubmit('createAndEdit')}
            >
                {t('record_edition.create_and_edit')}
            </KitButton>
        );
    }

    return headerSubmitButtons;
};
