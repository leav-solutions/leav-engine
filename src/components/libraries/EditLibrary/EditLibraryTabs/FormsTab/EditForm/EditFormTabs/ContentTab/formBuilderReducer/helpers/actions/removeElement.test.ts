import {FormElementTypes} from '../../../../../../../../../../../_gqlTypes/globalTypes';
import {layoutElements} from '../../../uiElements';
import {UIElementTypes} from '../../../_types';
import {
    defaultContainerId,
    defaultDepAttribute,
    defaultDepValue,
    FormBuilderActionTypes
} from '../../formBuilderReducer';
import {formElem1, formElem2, formElem3, formElem4, initialState} from '../../_fixtures/fixtures';
import removeElement from './removeElement';

describe('formBuilderReducer', () => {
    const removeElemInitialState = {
        ...initialState,
        elements: {
            [defaultDepAttribute]: {
                [defaultDepValue]: {
                    [defaultContainerId]: [
                        {
                            id: '123456',
                            containerId: defaultContainerId,
                            type: FormElementTypes.layout,
                            order: 0,
                            settings: {},
                            uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
                        },
                        {
                            id: '456',
                            containerId: defaultContainerId,
                            type: FormElementTypes.layout,
                            order: 1,
                            settings: {
                                title: 'divide'
                            },
                            uiElement: layoutElements[UIElementTypes.DIVIDER]
                        },
                        {
                            id: '123457',
                            containerId: defaultContainerId,
                            type: FormElementTypes.layout,
                            order: 2,
                            settings: {},
                            uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
                        }
                    ],
                    '123456': [
                        {
                            ...formElem1
                        },
                        {
                            ...formElem4
                        },
                        {
                            id: '123456_1',
                            containerId: '123456',
                            type: FormElementTypes.layout,
                            order: 0,
                            settings: {},
                            uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
                        }
                    ],
                    '123456_1': [
                        {
                            id: '123456_1_1',
                            containerId: '123456_1',
                            type: FormElementTypes.layout,
                            order: 0,
                            settings: {},
                            uiElement: layoutElements[UIElementTypes.DIVIDER]
                        }
                    ],
                    '123457': [
                        {
                            ...formElem2
                        }
                    ]
                }
            },
            category: {
                'category/12345': {
                    '123456': [
                        {
                            ...formElem3
                        }
                    ]
                }
            }
        },
        activeElements: {
            [defaultContainerId]: [
                {
                    id: '123456',
                    containerId: defaultContainerId,
                    type: FormElementTypes.layout,
                    order: 0,
                    settings: {},
                    uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
                },
                {
                    id: '456',
                    containerId: defaultContainerId,
                    type: FormElementTypes.layout,
                    order: 1,
                    settings: {
                        title: 'divide'
                    },
                    uiElement: layoutElements[UIElementTypes.DIVIDER]
                },
                {
                    id: '123457',
                    containerId: defaultContainerId,
                    type: FormElementTypes.layout,
                    order: 2,
                    settings: {},
                    uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
                }
            ],
            '123456': [
                {
                    ...formElem1,
                    herited: false
                },
                {
                    ...formElem4,
                    herited: false
                },
                {
                    id: '123456_1',
                    containerId: '123456',
                    type: FormElementTypes.layout,
                    order: 0,
                    settings: {},
                    uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER],
                    herited: false
                }
            ],
            '123456_1': [
                {
                    id: '123456_1_1',
                    containerId: '123456_1',
                    type: FormElementTypes.layout,
                    order: 0,
                    settings: {},
                    uiElement: layoutElements[UIElementTypes.DIVIDER],
                    herited: false
                }
            ],
            '123457': [
                {
                    ...formElem2,
                    herited: false
                }
            ]
        }
    };

    describe('REMOVE_ELEMENT', () => {
        test('Layout element', async () => {
            const newState = removeElement(removeElemInitialState, {
                type: FormBuilderActionTypes.REMOVE_ELEMENT,
                element: {
                    id: '123456',
                    order: 0,
                    type: FormElementTypes.layout,
                    containerId: defaultContainerId,
                    uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
                }
            });

            const newElements = newState.elements[defaultDepAttribute][defaultDepValue][defaultContainerId];

            // Element should be remove
            expect(newElements).toHaveLength(
                removeElemInitialState.elements[defaultDepAttribute][defaultDepValue][defaultContainerId].length - 1
            );
            expect(newElements.filter(el => el.id === '123456')).toHaveLength(0);
        });

        test('Should remove all children recursively', async () => {
            const newState = removeElement(removeElemInitialState, {
                type: FormBuilderActionTypes.REMOVE_ELEMENT,
                element: {
                    id: '123456',
                    order: 0,
                    type: FormElementTypes.layout,
                    containerId: defaultContainerId,
                    uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
                }
            });

            expect(newState.elements[defaultDepAttribute][defaultDepValue]['123456']).toBeUndefined();
            expect(newState.elements[defaultDepAttribute][defaultDepValue]['123456_1']).toBeUndefined();
            expect(newState.activeElements['123456']).toBeUndefined();
            expect(newState.activeElements['123456_1']).toBeUndefined();
        });

        test('Field element', async () => {
            const newState = removeElement(removeElemInitialState, {
                type: FormBuilderActionTypes.REMOVE_ELEMENT,
                element: {...formElem1}
            });
            const containerId = formElem1.containerId;

            expect(newState.elements[defaultDepAttribute][defaultDepValue][containerId]).toHaveLength(
                removeElemInitialState.elements[defaultDepAttribute][defaultDepValue][containerId].length - 1
            );
            expect(newState.activeElements[containerId]).toHaveLength(
                removeElemInitialState.activeElements[containerId].length - 1
            );

            expect(
                newState.elements[defaultDepAttribute][defaultDepValue][containerId].filter(f => f.id === formElem1.id)
            ).toHaveLength(0);
            expect(newState.activeElements[containerId].filter(f => f.id === formElem1.id)).toHaveLength(0);
        });
    });
});
