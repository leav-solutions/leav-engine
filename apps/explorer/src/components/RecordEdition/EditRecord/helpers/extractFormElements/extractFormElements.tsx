// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordForm} from 'hooks/useGetRecordForm/useGetRecordForm';
import {formComponents} from '../../uiElements';
import ErrorField from '../../uiElements/ErrorField';
import {IFormElementsByContainer} from '../../_types';

export const extractFormElements = (form: IRecordForm): IFormElementsByContainer =>
    form.elements.reduce((allElements, element) => {
        if (typeof allElements[element.containerId] === 'undefined') {
            allElements[element.containerId] = [];
        }

        const uiElement = element.valueError ? ErrorField : formComponents[element.uiElementType];
        allElements[element.containerId].push({
            ...element,
            uiElement,
            settings: element.settings.reduce(
                (allSettings, curSettings) => ({...allSettings, [curSettings.key]: curSettings.value}),
                {}
            )
        });

        return allElements;
    }, {});
