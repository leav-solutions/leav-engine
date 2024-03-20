// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {possibleSubmitButtons, submitButtonsName} from '../_types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPenToSquare, faCheck} from '@fortawesome/free-solid-svg-icons';
import {EDIT_OR_CREATE_RECORD_FORM_ID} from '../EditRecordContent/formConstants';

export const useGetSubmitButtons = (
    buttons: possibleSubmitButtons,
    isInCreateMode: boolean,
    onClickSubmit: (button: submitButtonsName) => void
) => {
    const {t} = useSharedTranslation();
    const headerSubmitButtons = [];

    if (!isInCreateMode) {
        return [];
    }

    if (buttons.includes('create')) {
        headerSubmitButtons.push(
            <KitButton
                key="create"
                form={EDIT_OR_CREATE_RECORD_FORM_ID}
                type={!buttons.includes('createAndEdit') ? 'primary' : 'secondary'}
                htmlType="submit"
                icon={<FontAwesomeIcon icon={faCheck} />}
                onClick={() => onClickSubmit('create')}
            >
                {t('record_edition.create')}
            </KitButton>
        );
    }

    if (buttons.includes('createAndEdit')) {
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
