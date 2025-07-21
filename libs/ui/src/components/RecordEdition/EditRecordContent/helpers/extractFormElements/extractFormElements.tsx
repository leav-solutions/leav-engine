// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordForm} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {formComponents} from '../../uiElements';
import ErrorField from '../../uiElements/ErrorField';
import {IFormElementsByContainer} from '../../_types';
import {GetRecordColumnsValuesRecord} from '_ui/_queries/records/getRecordColumnsValues';
import {QueryResult} from '@apollo/client';
import {FORM_ROOT_CONTAINER_ID} from '@leav/utils';

const isComputeValueInError = (computeErrors: QueryResult['error'], attributeId: string): boolean =>
    computeErrors?.graphQLErrors[0]?.extensions?.fields?.[attributeId];
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
