import {type FunctionComponent} from 'react';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faInfo} from '@fortawesome/free-solid-svg-icons';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';
import {EditRecordReducerActionsTypes} from '../editRecordReducer/editRecordReducer';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EDIT_RECORD_SIDEBAR_TOGGLE_BUTON_ID} from '../constants';

export const ToggleSidebarButton: FunctionComponent = () => {
    const {t} = useSharedTranslation();
    const {state, dispatch} = useEditRecordReducer();
    const isOpen = state.isOpenSidebar ?? false;

    const toggleSidebar = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_SIDEBAR_IS_OPEN,
            isOpen: !isOpen,
        });
    };

    const buttonLabel = isOpen ? t('record_edition.close_sidebar') : t('record_edition.open_sidebar');

    if (!state.enableSidebar) {
        return null;
    }

    return (
        <KitTooltip title={buttonLabel}>
            <KitButton
                id={EDIT_RECORD_SIDEBAR_TOGGLE_BUTON_ID}
                type="secondary"
                size="m"
                active={isOpen}
                icon={<FontAwesomeIcon icon={faInfo} />}
                onClick={toggleSidebar}
                aria-label={buttonLabel}
            />
        </KitTooltip>
    );
};
