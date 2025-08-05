// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordForm} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {formComponents} from '../../uiElements';
import ErrorField from '../../uiElements/ErrorField';
import {IFormElementsByContainer} from '../../_types';
import {QueryResult} from '@apollo/client';
import {FORM_ROOT_CONTAINER_ID} from '@leav/utils';

const isComputeValueInError = (computeErrors: QueryResult['error'], attributeId: string): boolean =>
    computeErrors?.graphQLErrors[0]?.extensions?.fields?.[attributeId];

/**
 * Extracts and organizes form elements by their container IDs.
 *
 * This function processes the `elements` property of the given form object, organizing
 * them into a structured object grouped by their respective `containerId`. If no `containerId`
 * is specified for an element, it defaults to `FORM_ROOT_CONTAINER_ID`. Additionally, it determines
 * the UI representation (`uiElement`) of each element based on various properties, such as error states
 * and type, and processes element settings.
 *
 * @param {IRecordForm} form - The form object containing elements to be processed.
 * @param {QueryResult['error']} computeErrors - The set of compute errors used to determine error states of elements.
 * @returns {IFormElementsByContainer} An object where each key represents a container ID and its value is an array of
 * elements belonging to that container. Each element includes processed properties such as `uiElement` and updated settings.
 */
export const extractFormElements = (
    form: IRecordForm,
    computeErrors: QueryResult['error']
): IFormElementsByContainer => {
    if (!form?.elements) {
        return {};
    }

    return form.elements.reduce((allElements, element) => {
        // Ensure containerId exists (use FORM_ROOT_CONTAINER_ID for root elements)
        const containerId = element.containerId || FORM_ROOT_CONTAINER_ID;

        // Initialize array for this container if it doesn't exist
        if (!allElements[containerId]) {
            allElements[containerId] = [];
        }

        const computeInError = element.attribute?.id
            ? isComputeValueInError(computeErrors, element.attribute?.id)
            : false;

        const uiElement =
            (element.valueError && (!element.values || !element.values[element.attribute?.id])) || computeInError
                ? ErrorField
                : formComponents[element.uiElementType];

        const useAttributeLabel = element.settings.find(setting => setting.key === 'useAttributeLabel')?.value;

        const settings = element.settings.reduce((allSettings, curSettings) => {
            if (curSettings.key === 'label') {
                return {
                    ...allSettings,
                    label: useAttributeLabel ? element.attribute?.label : curSettings.value
                };
            }
            return {...allSettings, [curSettings.key]: curSettings.value};
        }, {});

        allElements[containerId].push({
            ...element,
            uiElement,
            settings
        });

        return allElements;
    }, {});
};
