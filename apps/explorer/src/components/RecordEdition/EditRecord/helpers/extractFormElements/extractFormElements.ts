// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_FORM_forms_list} from '_gqlTypes/GET_FORM';
import {formComponents} from '../../uiElements';
import {IDependencyValues, IFormElementsByContainer} from '../../_types';

export const extractFormElements = (
    form: GET_FORM_forms_list,
    dependencyValues: IDependencyValues = {}
): IFormElementsByContainer =>
    form.elements.reduce((elements, elemWithDepValue) => {
        const {dependencyValue} = elemWithDepValue;

        if (
            dependencyValue !== null &&
            dependencyValues[dependencyValue.attribute] &&
            !dependencyValues[dependencyValue.attribute].find(
                depValue =>
                    depValue.id === dependencyValue.value.id && depValue.library === dependencyValue.value.library
            )
        ) {
            return elements;
        }

        for (const elem of elemWithDepValue.elements) {
            elements[elem.containerId] = [
                ...(elements[elem.containerId] ?? []),
                {
                    ...elem,
                    uiElement: formComponents[elem.uiElementType],
                    settings: elem.settings.reduce(
                        (allSettings, curSettings) => ({...allSettings, [curSettings.key]: curSettings.value}),
                        {}
                    )
                }
            ];
        }

        return elements;
    }, {});
