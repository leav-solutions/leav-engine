// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RECORD_FORM_recordForm} from '_gqlTypes/RECORD_FORM';
import {formComponents} from '../../uiElements';
import {IFormElementsByContainer} from '../../_types';

export const extractFormElements = (form: RECORD_FORM_recordForm): IFormElementsByContainer =>
    form.elements.reduce((allElements, element) => {
        if (typeof allElements[element.containerId] === 'undefined') {
            allElements[element.containerId] = [];
        }

        allElements[element.containerId].push({
            ...element,
            uiElement: formComponents[element.uiElementType],
            settings: element.settings.reduce(
                (allSettings, curSettings) => ({...allSettings, [curSettings.key]: curSettings.value}),
                {}
            )
        });

        return allElements;
    }, {});
