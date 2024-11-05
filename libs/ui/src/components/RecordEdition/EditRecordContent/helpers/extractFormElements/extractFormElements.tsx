// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordForm} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {formComponents} from '../../uiElements';
import ErrorField from '../../uiElements/ErrorField';
import {IFormElementsByContainer} from '../../_types';

export const extractFormElements = (form: IRecordForm): IFormElementsByContainer =>
    form.elements.reduce((allElements, element) => {
        if (typeof allElements[element.containerId] === 'undefined') {
            allElements[element.containerId] = [];
        }

        const uiElement = element.valueError ? ErrorField : formComponents[element.uiElementType];
        const useAttributeLabel = element.settings.find(setting => setting.key === 'useAttributeLabel')?.value;

        const settings = element.settings.reduce((allSettings, curSettings) => {
            if (curSettings.key === 'label') {
                return {
                    ...allSettings,
                    label: useAttributeLabel ? element.attribute.label : curSettings.value
                };
            }
            return {...allSettings, [curSettings.key]: curSettings.value};
        }, {});

        allElements[element.containerId].push({
            ...element,
            uiElement,
            settings
        });

        return allElements;
    }, {});
