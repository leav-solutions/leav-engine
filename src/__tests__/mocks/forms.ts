import {FormFieldType, FormLayoutElementType, IForm, IFormInputField} from '../../_types/forms';

const myField: IFormInputField = {
    containerId: 'some_container',
    attribute: 'test_attribute',
    type: FormFieldType.INPUT_FIELD,
    required: false
};

export const mockForm: IForm = {
    id: 'test_form',
    library: 'my_lib',
    label: {fr: 'Test Form'},
    layout: [
        {
            id: 'some_container',
            type: FormLayoutElementType.FIELDS_CONTAINER
        }
    ],
    fields: [{fields: [myField]}]
};
