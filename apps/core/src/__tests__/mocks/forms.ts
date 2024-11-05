// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, FormUIElementTypes, FORM_ROOT_CONTAINER_ID} from '@leav/utils';
import {FormElementTypes, IFormElement, IFormStrict} from '../../_types/forms';

export const formField: IFormElement = {
    id: '123456',
    order: 0,
    type: FormElementTypes.field,
    uiElementType: FormFieldTypes.TEXT_INPUT,
    containerId: '987654',
    settings: {
        attribute: 'test_attribute'
    }
};

export const formLayoutElement: IFormElement = {
    id: '987654',
    order: 0,
    type: FormElementTypes.layout,
    uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
    containerId: FORM_ROOT_CONTAINER_ID,
    settings: {}
};

export const mockForm: IFormStrict = {
    id: 'test_form',
    library: 'my_lib',
    system: false,
    dependencyAttributes: [],
    label: {fr: 'Test Form'},
    elements: [{elements: [formField, formLayoutElement]}]
};
