import {RefObject, useState, type FunctionComponent} from 'react';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAngleLeft, faAngleRight} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';
import {EditRecordReducerActionsTypes} from '../editRecordReducer/editRecordReducer';

export interface ISidebarButtonProps {
    outOfContextReferences?: RefObject<HTMLElement>;
}
export const SidebarButton: FunctionComponent<ISidebarButtonProps> = ({outOfContextReferences}) => {
    const {t} = useTranslation();
    const {state, dispatch} = useEditRecordReducer();
    const [isOpen, setIsOpen] = useState(
        outOfContextReferences && outOfContextReferences.current
            ? outOfContextReferences.current.dataset.isOpen === 'true'
            : state.sidebarContent !== 'none'
    );

    if (outOfContextReferences) {
        console.log('ref available');

        outOfContextReferences.current &&
            console.log('outOfContextReferences.current.dataset.isOpen', outOfContextReferences.current.dataset.isOpen);
    }
    const toggleSidebar = () => {
        if (outOfContextReferences) {
            // setIsOpen(!isOpen);
            return;
        }

        dispatch({
            type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
            content: isOpen ? 'none' : 'summary'
        });
        setIsOpen(!isOpen);
    };

    const buttonLabel = isOpen ? t('sidebar.close_details_panel') : t('sidebar.open_details_panel');
    const buttonIcon = isOpen ? faAngleRight : faAngleLeft;
    const buttonId = `edit-record-side-bar-button-${isOpen ? 'open' : 'close'}`;
    return (
        <KitTooltip title={buttonLabel} mouseEnterDelay={1}>
            <KitButton
                id={buttonId}
                ref={outOfContextReferences}
                icon={<FontAwesomeIcon icon={buttonIcon} />}
                onClick={toggleSidebar}
                aria-label={buttonLabel}
            />
        </KitTooltip>
    );
};
