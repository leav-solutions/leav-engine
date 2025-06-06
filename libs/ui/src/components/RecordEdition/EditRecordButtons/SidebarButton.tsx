// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RefObject, useState, type FunctionComponent} from 'react';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAngleLeft, faAngleRight} from '@fortawesome/free-solid-svg-icons';
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
            isOpen: !isOpen
        });
    };

    const buttonLabel = isOpen ? t('record_edition.close_sidebar') : t('record_edition.open_sidebar');

    if (!state.enableSidebar) {
        return null;
    }

    return (
        <KitTooltip title={buttonLabel} mouseEnterDelay={1}>
            <KitButton
                id={EDIT_RECORD_SIDEBAR_TOGGLE_BUTON_ID}
                type="tertiary"
                icon={<FontAwesomeIcon icon={isOpen ? faAngleRight : faAngleLeft} />}
                onClick={toggleSidebar}
                aria-label={buttonLabel}
            />
        </KitTooltip>
    );
};
