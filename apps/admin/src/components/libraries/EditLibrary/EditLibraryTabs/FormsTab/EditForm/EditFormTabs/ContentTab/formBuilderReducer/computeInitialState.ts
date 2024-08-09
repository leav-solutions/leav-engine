// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_FORM_forms_list} from '../../../../../../../../../_gqlTypes/GET_FORM';
import {FormElementTypes} from '../../../../../../../../../_gqlTypes/globalTypes';
import {IFormElement} from '../_types';
import {formElements, layoutElements} from '../uiElements';
import {
    ElementsByDependencyAttribute,
    IFormBuilderState,
    defaultContainerId,
    defaultDepAttribute,
    defaultDepValue
} from './formBuilderReducer';
import sortByOrder from './helpers/sortByOrder';

export default function computeInitialState(library: string, form: GET_FORM_forms_list): IFormBuilderState {
    // Transform received flat list of fields to nested fields by dependencies
    const fieldsByDeps: ElementsByDependencyAttribute = form.elements.reduce(
        (acc, cur) => {
            const fieldsByContainer = cur.elements.reduce((groupedFields, field) => {
                const containerId = field.containerId || defaultContainerId;

                const {uiElementType, ...neededFieldData} = field;

                const uiElement =
                    field.type === FormElementTypes.layout
                        ? layoutElements[uiElementType]
                        : formElements[uiElementType];

                const useAttributeLabel =
                    field.settings.find(setting => setting.key === 'useAttributeLabel')?.value;

                const hydratedField: IFormElement = {
                    ...neededFieldData,
                    uiElement,
                    settings: field.settings.reduce(
                        (allSettings, curSettings) => {
                            let value = curSettings.value;

                            if (curSettings.key === 'columns') {
                                value = value.map(col => {
                                    if (typeof col === 'object' && typeof col.id !== 'undefined') {
                                        return col.id;
                                    }

                                    return col;
                                });
                            }

                            return {
                                ...allSettings,
                                [curSettings.key]: value
                            };
                        },
                        {
                            useAttributeLabel: !!useAttributeLabel
                        }
                    )
                };

                if (typeof groupedFields[containerId] === 'undefined') {
                    groupedFields[containerId] = [];
                }

                groupedFields[containerId].push(hydratedField);

                return groupedFields;
            }, {});

            if (!cur.dependencyValue) {
                acc[defaultDepAttribute][defaultDepValue] = fieldsByContainer;
                return acc;
            }

            const depAttr = cur.dependencyValue.attribute;

            if (typeof acc[depAttr] === 'undefined') {
                acc[depAttr] = {};
            }

            const depKey = cur.dependencyValue.value ?? '__root__';

            acc[depAttr][depKey] = fieldsByContainer;

            return acc;
        },
        {[defaultDepAttribute]: {[defaultDepValue]: {}}}
    );

    // Set default fields as active fields. Add herited flag to false on these fields
    const activeFields = {...fieldsByDeps[defaultDepAttribute][defaultDepValue]};
    for (const containerId of Object.keys(activeFields)) {
        activeFields[containerId] = activeFields[containerId].map(f => ({...f, herited: false})).sort(sortByOrder);
    }

    return {
        form,
        library,
        activeDependency: null,
        openSettings: false,
        elementInSettings: null,
        elements: fieldsByDeps,
        activeElements: activeFields
    };
}
