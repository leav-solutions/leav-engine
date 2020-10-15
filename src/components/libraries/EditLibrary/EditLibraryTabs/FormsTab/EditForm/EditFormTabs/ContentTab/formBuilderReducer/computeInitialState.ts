import {GET_FORM_forms_list} from '../../../../../../../../../_gqlTypes/GET_FORM';
import {FormElementTypes} from '../../../../../../../../../_gqlTypes/globalTypes';
import {formElements, layoutElements} from '../uiElements';
import {IFormElement} from '../_types';
import {
    defaultContainerId,
    defaultDepAttribute,
    defaultDepValue,
    ElementsByDependencyAttribute,
    IFormBuilderState
} from './formBuilderReducer';
import getKeyFromDepValue from './helpers/getKeyFromDepValue';
import sortByOrder from './helpers/sortByOrder';

export default (library: string, form: GET_FORM_forms_list): IFormBuilderState => {
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

                const hydratedField: IFormElement = {
                    ...neededFieldData,
                    uiElement,
                    settings: field.settings.reduce(
                        (allSettings, curSettings) => ({
                            ...allSettings,
                            [curSettings.key]: curSettings.value
                        }),
                        {}
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

            const depKey = getKeyFromDepValue({
                id: cur.dependencyValue.value.id || '',
                library: {id: cur.dependencyValue.value.library || '', label: null},
                label: '',
                color: '',
                preview: null
            });

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
};
