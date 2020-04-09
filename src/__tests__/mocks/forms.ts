import {FormFieldType, FormLayoutElementType, IFormInputField, IFormStrict} from '../../_types/forms';

const myField: IFormInputField = {
    containerId: 'some_container',
    attribute: 'test_attribute',
    type: FormFieldType.INPUT_FIELD,
    required: false
};

export const mockForm: IFormStrict = {
    id: 'test_form',
    library: 'my_lib',
    system: false,
    dependencyAttributes: [],
    label: {fr: 'Test Form'},
    layout: [
        {
            id: 'some_container',
            type: FormLayoutElementType.FIELDS_CONTAINER
        }
    ],
    fields: [{fields: [myField]}]
};
