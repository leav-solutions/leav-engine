// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFormElementFragment} from '_ui/_gqlTypes';
import {
    EditRecordReducerActionsTypes,
    IEditRecordReducerActions,
    IRecordPropertyWithAttribute
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {EDIT_RECORD_SIDEBAR_ID, LINK_FIELD_ID_PREFIX, STANDARD_FIELD_ID_PREFIX} from '_ui/constants';
import {RecordFormElementsValue} from '_ui/hooks/useGetRecordForm';
import {Dispatch, useEffect, useRef} from 'react';

interface IUseOutsideInteractionDetectorProps {
    attribute: RecordFormElementFragment['attribute'];
    activeAttribute: IRecordPropertyWithAttribute | null;
    dispatch: Dispatch<IEditRecordReducerActions>;
    formIdToLoad: string | 'edition' | 'creation';
    backendValues: RecordFormElementsValue[];
    pendingValues: RecordFormElementsValue[];
    allowedSelectors?: string[];
    attributePrefix?: typeof LINK_FIELD_ID_PREFIX | typeof STANDARD_FIELD_ID_PREFIX;
}

export const useOutsideInteractionDetector = ({
    attribute,
    activeAttribute,
    attributePrefix,
    dispatch,
    formIdToLoad,
    backendValues,
    pendingValues,
    allowedSelectors = []
}: IUseOutsideInteractionDetectorProps) => {
    // Use a ref to store the current props to access them in the event handlers
    // This will prevent issue when multiple event handlers are attached to the document
    const hookPropsRef = useRef({
        attribute,
        activeAttribute,
        attributePrefix,
        allowedSelectors,
        formIdToLoad,
        backendValues,
        pendingValues
    });

    useEffect(() => {
        hookPropsRef.current = {
            attribute,
            activeAttribute,
            attributePrefix,
            allowedSelectors,
            formIdToLoad,
            backendValues,
            pendingValues
        };
    }, [attribute, activeAttribute, attributePrefix, allowedSelectors, formIdToLoad, backendValues, pendingValues]);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const currentProps = hookPropsRef.current;
            const elementSelector = '#' + currentProps.attributePrefix + currentProps.attribute.id;

            const target = event.target as HTMLElement;
            const isClickOnThisElement = target.closest(elementSelector) !== null;

            if (isClickOnThisElement) {
                dispatch({
                    type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                    attribute: currentProps.attribute,
                    values: formIdToLoad === 'creation' ? currentProps.pendingValues : currentProps.backendValues
                });
                return;
            }

            const sideBarSelector = '#' + EDIT_RECORD_SIDEBAR_ID;
            const isClickInsideSidebar = target.closest(sideBarSelector) !== null;

            const isClickOnAllowedSelector =
                currentProps.allowedSelectors.length > 0 &&
                currentProps.allowedSelectors.some(selector => target.closest(selector) !== null);

            if (
                currentProps.activeAttribute !== null &&
                currentProps.activeAttribute.attribute.id === currentProps.attribute.id &&
                !isClickInsideSidebar &&
                !isClickOnAllowedSelector
            ) {
                dispatch({
                    type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                    attribute: null
                });
            }
        };

        const handleFocus = (event: FocusEvent) => {
            const currentProps = hookPropsRef.current;
            const elementSelector = '#' + currentProps.attributePrefix + currentProps.attribute.id;

            const target = event.target as HTMLElement;
            const isFocusInsideTargetElement = target.closest(elementSelector) !== null;

            if (isFocusInsideTargetElement) {
                dispatch({
                    type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                    attribute: currentProps.attribute,
                    values: formIdToLoad === 'creation' ? currentProps.pendingValues : currentProps.backendValues
                });
            }
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('focusin', handleFocus);

        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('focusin', handleFocus);
        };
    }, [dispatch]);
};
