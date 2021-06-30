// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, FormUIElementTypes} from '@leav/utils';
import {Input} from 'antd';
import {FormElementTypes} from '_gqlTypes/globalTypes';
import {mockForm} from '__mocks__/common/form';
import Container from '../../uiElements/Container';
import {extractFormElements} from './extractFormElements';

describe('extractFormElements', () => {
    test('Return form elements grouped by container', async () => {
        const baseForm = {
            ...mockForm,
            elements: [
                {
                    dependencyValue: null,
                    elements: [
                        {
                            id: 'rootElem1',
                            containerId: '__root',
                            settings: [{key: 'foo', value: 'bar'}],
                            attribute: null,
                            type: FormElementTypes.field,
                            uiElementType: FormFieldTypes.TEXT_INPUT
                        },
                        {
                            id: 'rootElem2',
                            containerId: '__root',
                            settings: [],
                            attribute: null,
                            type: FormElementTypes.layout,
                            uiElementType: FormUIElementTypes.FIELDS_CONTAINER
                        },
                        {
                            id: 'rootElem3',
                            containerId: '__root',
                            settings: [],
                            attribute: null,
                            type: FormElementTypes.layout,
                            uiElementType: FormUIElementTypes.FIELDS_CONTAINER
                        },
                        {
                            id: 'containerElem1',
                            containerId: 'rootElem2',
                            settings: [],
                            attribute: null,
                            type: FormElementTypes.layout,
                            uiElementType: FormUIElementTypes.FIELDS_CONTAINER
                        },
                        {
                            id: 'subContainerElem1',
                            containerId: 'containerElem1',
                            settings: [],
                            attribute: null,
                            type: FormElementTypes.field,
                            uiElementType: FormFieldTypes.TEXT_INPUT
                        }
                    ]
                }
            ]
        };

        const convertForm = extractFormElements(baseForm);

        const expectation = {
            __root: [
                {
                    id: 'rootElem1',
                    containerId: '__root',
                    settings: {foo: 'bar'},
                    attribute: null,
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT,
                    uiElement: Input
                },
                {
                    id: 'rootElem2',
                    containerId: '__root',
                    settings: {},
                    attribute: null,
                    type: FormElementTypes.layout,
                    uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
                    uiElement: Container
                },
                {
                    id: 'rootElem3',
                    containerId: '__root',
                    settings: {},
                    attribute: null,
                    type: FormElementTypes.layout,
                    uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
                    uiElement: Container
                }
            ],
            rootElem2: [
                {
                    id: 'containerElem1',
                    containerId: 'rootElem2',
                    settings: {},
                    attribute: null,
                    type: FormElementTypes.layout,
                    uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
                    uiElement: Container
                }
            ],
            containerElem1: [
                {
                    id: 'subContainerElem1',
                    containerId: 'containerElem1',
                    settings: {},
                    attribute: null,
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT,
                    uiElement: Input
                }
            ]
        };

        // Test on stringified objext due to failure caused by some object references
        expect(JSON.stringify(convertForm)).toBe(JSON.stringify(expectation));
    });

    test('Retrieve fields for given dependencies', async () => {
        const formWithDeps: typeof mockForm = {
            ...mockForm,
            dependencyAttributes: [
                {
                    id: 'dep_attribute1',
                    label: null
                },
                {
                    id: 'dep_attribute2',
                    label: null
                }
            ],
            elements: [
                {
                    dependencyValue: null,
                    elements: [
                        {
                            id: 'rootElem1',
                            containerId: '__root',
                            settings: [{key: 'foo', value: 'bar'}],
                            attribute: null,
                            type: FormElementTypes.field,
                            uiElementType: FormFieldTypes.TEXT_INPUT
                        }
                    ]
                },
                {
                    dependencyValue: {
                        attribute: 'dep_attribute1',
                        value: {id: 'A', library: 'dep_lib1'}
                    },
                    elements: [
                        {
                            id: 'rootElem2',
                            containerId: '__root',
                            settings: [],
                            attribute: null,
                            type: FormElementTypes.layout,
                            uiElementType: FormUIElementTypes.FIELDS_CONTAINER
                        }
                    ]
                },
                {
                    dependencyValue: {
                        attribute: 'dep_attribute1',
                        value: {id: 'B', library: 'dep_lib1'}
                    },
                    elements: [
                        {
                            id: 'rootElem3',
                            containerId: '__root',
                            settings: [],
                            attribute: null,
                            type: FormElementTypes.layout,
                            uiElementType: FormUIElementTypes.FIELDS_CONTAINER
                        }
                    ]
                },
                {
                    dependencyValue: {
                        attribute: 'dep_attribute2',
                        value: {id: 'A', library: 'dep_lib2'}
                    },
                    elements: [
                        {
                            id: 'containerElem1',
                            containerId: 'rootElem2',
                            settings: [],
                            attribute: null,
                            type: FormElementTypes.layout,
                            uiElementType: FormUIElementTypes.FIELDS_CONTAINER
                        }
                    ]
                },
                {
                    dependencyValue: {
                        attribute: 'dep_attribute2',
                        value: {id: 'C', library: 'dep_lib2'}
                    },
                    elements: [
                        {
                            id: 'subContainerElem1',
                            containerId: 'containerElem1',
                            settings: [],
                            attribute: null,
                            type: FormElementTypes.field,
                            uiElementType: FormFieldTypes.TEXT_INPUT
                        }
                    ]
                }
            ]
        };

        const convertForm = extractFormElements(formWithDeps, {
            dep_attribute1: [
                {id: 'C', library: 'dep_lib1'},
                {id: 'B', library: 'dep_lib1'},
                {id: 'A', library: 'dep_lib1'}
            ],
            dep_attribute2: [
                {id: 'B', library: 'dep_lib2'},
                {id: 'A', library: 'dep_lib2'}
            ]
        });

        const expectation = {
            __root: [
                {
                    id: 'rootElem1',
                    containerId: '__root',
                    settings: {foo: 'bar'},
                    attribute: null,
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT,
                    uiElement: Input
                },
                {
                    id: 'rootElem2',
                    containerId: '__root',
                    settings: {},
                    attribute: null,
                    type: FormElementTypes.layout,
                    uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
                    uiElement: Container
                },
                {
                    id: 'rootElem3',
                    containerId: '__root',
                    settings: {},
                    attribute: null,
                    type: FormElementTypes.layout,
                    uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
                    uiElement: Container
                }
            ],
            rootElem2: [
                {
                    id: 'containerElem1',
                    containerId: 'rootElem2',
                    settings: {},
                    attribute: null,
                    type: FormElementTypes.layout,
                    uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
                    uiElement: Container
                }
            ]
        };

        // Test on stringified objext due to failure caused by some object references
        expect(JSON.stringify(convertForm)).toBe(JSON.stringify(expectation));
    });
});
