import {FormFieldTypes, FormUIElementTypes, FORM_ROOT_CONTAINER_ID} from '@leav/utils';
import {FormElementTypes, type IFormElement, type IFormStrict} from '../../_types/forms';

export const formField: IFormElement = {
    id: '123456',
    order: 0,
    type: FormElementTypes.FIELD,
    uiElementType: FormFieldTypes.TEXT_INPUT,
    containerId: '987654',
    settings: {
        attribute: 'test_attribute',
    },
};

export const formLayoutElement: IFormElement = {
    id: '987654',
    order: 0,
    type: FormElementTypes.LAYOUT,
    uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
    containerId: FORM_ROOT_CONTAINER_ID,
    settings: {},
};

export const mockForm: IFormStrict = {
    id: 'test_form',
    library: 'my_lib',
    system: false,
    dependencyAttributes: [],
    label: {fr: 'Test Form'},
    elements: [{elements: [formField, formLayoutElement]}],
    sidePanel: {
        enable: false,
        isOpenByDefault: false,
    },
};
