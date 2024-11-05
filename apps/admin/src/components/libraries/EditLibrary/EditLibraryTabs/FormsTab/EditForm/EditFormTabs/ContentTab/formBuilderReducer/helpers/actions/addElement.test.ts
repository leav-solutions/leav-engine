// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormElementTypes} from '../../../../../../../../../../../_gqlTypes/globalTypes';
import {FieldTypes, UIElementTypes} from '../../../_types';
import {formElements, layoutElements} from '../../../uiElements';
import {mockInitialState} from '../../_fixtures/fixtures';
import {
    FormBuilderActionTypes,
    defaultContainerId,
    defaultDepAttribute,
    defaultDepValue
} from '../../formBuilderReducer';
import addElement from './addElement';

describe('formBuilderReducer', () => {
    describe('ADD_ELEMENT', () => {
        test('Layout element', async () => {
            const newState = addElement(mockInitialState, {
                type: FormBuilderActionTypes.ADD_ELEMENT,
                element: {
                    id: '987654321',
                    type: FormElementTypes.layout,
                    containerId: defaultContainerId,
                    uiElement: layoutElements[UIElementTypes.TEXT_BLOCK]
                },
                position: {order: 1, containerId: defaultContainerId}
            });

            const rootElements = newState.elements[defaultDepAttribute][defaultDepValue][defaultContainerId];
            expect(rootElements).toHaveLength(
                mockInitialState.elements[defaultDepAttribute][defaultDepValue][defaultContainerId].length + 1
            );
            expect(rootElements[1].uiElement.type).toBe(UIElementTypes.TEXT_BLOCK);
        });

        test('Field element with no dep', async () => {
            const newState = addElement(mockInitialState, {
                type: FormBuilderActionTypes.ADD_ELEMENT,
                element: {
                    id: '741852963',
                    containerId: '123456',
                    type: FormElementTypes.field,
                    uiElement: formElements[FieldTypes.TEXT_INPUT]
                },
                position: {order: 1, containerId: '123456'}
            });

            expect(newState.elements[defaultDepAttribute][defaultDepValue]['123456'].length).toBe(
                mockInitialState.elements[defaultDepAttribute][defaultDepValue]['123456'].length + 1
            );
            expect(newState.activeElements['123456'].length).toBe(mockInitialState.activeElements['123456'].length + 1);
        });

        test('Field element on existing dep', async () => {
            const newState = addElement(
                {
                    ...mockInitialState,
                    activeDependency: {
                        attribute: 'category',
                        value: {
                            id: '98731',
                            record: {
                                whoAmI: {
                                    id: '12345',
                                    library: {
                                        id: 'category',
                                        label: null
                                    },
                                    label: null,
                                    color: null,
                                    preview: null
                                }
                            }
                        },
                        ancestors: []
                    }
                },
                {
                    type: FormBuilderActionTypes.ADD_ELEMENT,
                    element: {
                        id: '963852741',
                        containerId: '123456',
                        type: FormElementTypes.field,
                        uiElement: formElements[FieldTypes.TEXT_INPUT]
                    },
                    position: {order: 1, containerId: '123456'}
                }
            );

            expect(newState.elements.category['category/12345']['123456'].length).toBe(
                mockInitialState.elements.category['category/12345']['123456'].length + 1
            );
            expect(newState.activeElements['123456'].length).toBe(mockInitialState.activeElements['123456'].length + 1);
        });

        test('Field element on new dep', async () => {
            const newState = addElement(
                {
                    ...mockInitialState,
                    activeDependency: {
                        attribute: 'type',
                        value: {
                            id: '987321',
                            record: {
                                whoAmI: {
                                    id: '12345',
                                    library: {
                                        id: 'type',
                                        label: null
                                    },
                                    label: null,
                                    color: null,
                                    preview: null
                                }
                            }
                        },
                        ancestors: []
                    }
                },
                {
                    type: FormBuilderActionTypes.ADD_ELEMENT,
                    element: {
                        id: '963852741',
                        containerId: '123456',
                        type: FormElementTypes.field,
                        uiElement: formElements[FieldTypes.TEXT_INPUT]
                    },
                    position: {order: 1, containerId: '123456'}
                }
            );

            expect(newState.elements.type['type/12345']['123456']).toBeDefined();
            expect(newState.elements.type['type/12345']['123456'].length).toBe(1);
            expect(newState.activeElements['123456'].length).toBe(mockInitialState.activeElements['123456'].length + 1);
        });
    });
});
