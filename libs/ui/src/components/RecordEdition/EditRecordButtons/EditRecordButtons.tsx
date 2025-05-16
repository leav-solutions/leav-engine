// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton, KitSpace} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRotateRight, faLayerGroup} from '@fortawesome/free-solid-svg-icons';
import {createPortal} from 'react-dom';
import {useEffect, useState} from 'react';
import {EDIT_RECORD_MODAL_HEADER_CONTAINER_BUTTONS} from '../constants';
import {ToggleSidebarButton} from './SidebarButton';
import {EditRecordReducerActionsTypes, EditRecordSidebarContentTypeMap} from '../editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';

const EditRecordButtons = () => {
    const [buttonsContainer, setButtonsContainer] = useState<HTMLElement>();
    const {state, dispatch} = useEditRecordReducer();

    useEffect(() => {
        const element = document.getElementById(EDIT_RECORD_MODAL_HEADER_CONTAINER_BUTTONS);

        if (element) {
            setButtonsContainer(element);
        }
    }, []);

    if (!buttonsContainer) {
        return null;
    }

    const handleRefreshClick = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.REQUEST_REFRESH
        });
    };

    const handleValuesVersionClick = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
            content:
                state.sidebarContent === EditRecordSidebarContentTypeMap.VALUES_VERSIONS
                    ? EditRecordSidebarContentTypeMap.SUMMARY
                    : EditRecordSidebarContentTypeMap.VALUES_VERSIONS
        });
    };

    const buttons = (
        <KitSpace size="xxs">
            <KitButton
                type="tertiary"
                icon={<FontAwesomeIcon icon={faLayerGroup} />}
                onClick={handleValuesVersionClick}
            />
            <KitButton type="tertiary" icon={<FontAwesomeIcon icon={faRotateRight} />} onClick={handleRefreshClick} />
            <ToggleSidebarButton />
        </KitSpace>
    );

    return createPortal(buttons, buttonsContainer);
};

export default EditRecordButtons;
