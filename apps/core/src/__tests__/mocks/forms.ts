// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormElementTypes, IFormElement, IFormStrict} from '../../_types/forms';

const myField: IFormElement = {
    id: '123456',
    order: 0,
    type: FormElementTypes.field,
    uiElementType: 'input',
    containerId: '987654',
    settings: {
        attribute: 'test_attribute'
    }
};

const myLayoutElement: IFormElement = {
    id: '987654',
    order: 0,
    type: FormElementTypes.layout,
    uiElementType: 'container',
    containerId: '__root',
    settings: {}
};

export const mockForm: IFormStrict = {
    id: 'test_form',
    library: 'my_lib',
    system: false,
    dependencyAttributes: [],
    label: {fr: 'Test Form'},
    elements: [{elements: [myField, myLayoutElement]}]
};
