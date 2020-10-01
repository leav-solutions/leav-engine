import {GET_FORM_forms_list} from '../_gqlTypes/GET_FORM';
import {GET_FORMS_LIST_forms_list} from '../_gqlTypes/GET_FORMS_LIST';
import {FormElementTypes} from '../_gqlTypes/globalTypes';

const myField = {
    id: '123456',
    order: 0,
    uiElementType: 'field_container',
    containerId: 'some_container',
    settings: [
        {key: 'attribute', value: 'test_attribute'},
        {key: 'required', value: false},
        {key: 'input', value: 'text'}
    ],
    type: FormElementTypes.layout
};

export const mockFormLight: GET_FORMS_LIST_forms_list = {
    id: 'test_form_light',
    system: false,
    label: {fr: 'Test Form'}
};

export const mockFormFull: GET_FORM_forms_list = {
    ...mockFormLight,
    id: 'test_form_full',
    system: false,
    dependencyAttributes: [],
    label: {fr: 'Test Form'},
    elements: [{dependencyValue: null, elements: [{...myField}]}]
};
