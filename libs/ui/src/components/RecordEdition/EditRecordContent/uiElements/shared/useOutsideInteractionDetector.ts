import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {EDIT_RECORD_SIDEBAR_ID, LINK_FIELD_ID_PREFIX} from '_ui/constants';
import {useEffect} from 'react';

export const useOutsideInteractionDetector = ({attribute, activeAttribute, dispatch, backendValues}) => {
    useEffect(() => {
        const elementSelector = '#' + LINK_FIELD_ID_PREFIX + attribute.id;
        const sideBarSelector = '#' + EDIT_RECORD_SIDEBAR_ID;

        const activateAttribute = () => {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                attribute,
                values: backendValues
            });
        };

        const handleClick = (event: MouseEvent | FocusEvent) => {
            const target = event.target as HTMLElement;

            const isClickInsideTargetElement = !!target.closest(elementSelector);
            const isClickInsideSidebar = !!target.closest(sideBarSelector);

            const isClickInsideAnyAttribute = !!target.closest(`[id^="${LINK_FIELD_ID_PREFIX}"]`);

            if (isClickInsideTargetElement) {
                activateAttribute();
            } else if (!isClickInsideSidebar && !isClickInsideAnyAttribute && activeAttribute !== null) {
                dispatch({
                    type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                    attribute: null
                });
            }
        };

        const handleFocus = (event: MouseEvent | FocusEvent) => {
            const target = event.target as HTMLElement;

            const isFocusInsideTargetElement = !!target.closest(elementSelector);

            if (isFocusInsideTargetElement) {
                activateAttribute();
            }
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('focusin', handleFocus);

        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('focusin', handleFocus);
        };
    }, [attribute.id, activeAttribute, dispatch, backendValues]);
};
