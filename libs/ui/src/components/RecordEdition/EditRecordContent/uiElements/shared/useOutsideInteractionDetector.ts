import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {EDIT_RECORD_SIDEBAR_ID} from '_ui/constants';
import {useEffect} from 'react';

export const useOutsideInteractionDetector = ({
    attribute,
    activeAttribute,
    attributePrefix,
    dispatch,
    backendValues,
    allowedSelectors = []
}) => {
    useEffect(() => {
        const elementSelector = '#' + attributePrefix + attribute.id;
        const sideBarSelector = '#' + EDIT_RECORD_SIDEBAR_ID;
        const allAllowedSelectors = [elementSelector, sideBarSelector, ...allowedSelectors].join(', ');

        const activateAttribute = () => {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                attribute,
                values: backendValues
            });
        };

        const unsetActiveAttribute = () => {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                attribute: null
            });
        };

        const handleClick = (event: MouseEvent | FocusEvent) => {
            const target = event.target as HTMLElement;

            const isClickInsideAllowedArea = target.closest(allAllowedSelectors) !== null;
            const isClickInsideAnyAttribute = target.closest(`[id^="${attributePrefix}"]`) !== null;

            if (isClickInsideAllowedArea) {
                activateAttribute();
            } else if (!isClickInsideAllowedArea && !isClickInsideAnyAttribute && activeAttribute !== null) {
                unsetActiveAttribute();
            }
        };

        const handleFocus = (event: MouseEvent | FocusEvent) => {
            const target = event.target as HTMLElement;

            const isFocusInsideTargetElement = target.closest(elementSelector) !== null;

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
    }, [attribute.id, activeAttribute, dispatch, backendValues, attributePrefix, allowedSelectors]);
};
