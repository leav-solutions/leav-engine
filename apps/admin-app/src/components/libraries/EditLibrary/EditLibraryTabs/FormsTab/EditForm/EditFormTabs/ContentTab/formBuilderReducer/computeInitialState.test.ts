// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormElementTypes} from '../../../../../../../../../_gqlTypes/globalTypes';
import {formElements, layoutElements} from '../uiElements';
import {FieldTypes, UIElementTypes} from '../_types';
import computeInitialState from './computeInitialState';
import {defaultContainerId, defaultDepAttribute, defaultDepValue} from './formBuilderReducer';
import {formData, formElem1, formElem2, formElem3} from './_fixtures/fixtures';

jest.mock('../uiElements');

describe('computeInitialState', () => {
    test('Transform form data into reducer state', async () => {
        const res = computeInitialState('ubs', formData);
        const expectation = {
            form: formData,
            library: 'ubs',
            activeDependency: null,
            openSettings: false,
            elementInSettings: null,
            elements: {
                [defaultDepAttribute]: {
                    [defaultDepValue]: {
                        '123456': [
                            {
                                ...formElem1
                            }
                        ],
                        '123457': [
                            {
                                ...formElem2
                            }
                        ],
                        [defaultContainerId]: [
                            {
                                id: '123',
                                order: 0,
                                type: FormElementTypes.layout,
                                containerId: defaultContainerId,
                                settings: {},
                                uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
                            },
                            {
                                id: '456',
                                order: 1,
                                type: FormElementTypes.layout,
                                containerId: defaultContainerId,
                                settings: {
                                    title: 'divide'
                                },
                                uiElement: layoutElements[UIElementTypes.DIVIDER]
                            },
                            {
                                id: '789',
                                order: 2,
                                type: FormElementTypes.layout,
                                containerId: defaultContainerId,
                                settings: {},
                                uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
                            },
                            {
                                id: '999',
                                order: 3,
                                type: FormElementTypes.field,
                                containerId: defaultContainerId,
                                settings: {columns: ['col1']},
                                uiElement: formElements[FieldTypes.LINK]
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
                '123456': [
                    {
                        ...formElem1,
                        herited: false
                    }
                ],
                '123457': [
                    {
                        ...formElem2,
                        herited: false
                    }
                ],
                [defaultContainerId]: [
                    {
                        id: '123',
                        order: 0,
                        type: FormElementTypes.layout,
                        containerId: defaultContainerId,
                        settings: {},
                        uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER],
                        herited: false
                    },
                    {
                        id: '456',
                        order: 1,
                        type: FormElementTypes.layout,
                        containerId: defaultContainerId,
                        settings: {
                            title: 'divide'
                        },
                        uiElement: layoutElements[UIElementTypes.DIVIDER],
                        herited: false
                    },
                    {
                        id: '789',
                        order: 2,
                        type: FormElementTypes.layout,
                        containerId: defaultContainerId,
                        settings: {},
                        uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER],
                        herited: false
                    },
                    {
                        id: '999',
                        order: 3,
                        type: FormElementTypes.field,
                        containerId: defaultContainerId,
                        settings: {columns: ['col1']},
                        uiElement: formElements[FieldTypes.LINK],
                        herited: false
                    }
                ]
            }
        };

        // We test on objects stringification here because jest keeps saying objects are not equals (with toEqual()
        // or toMatchObject()) even though they serialize to the same string. Probably due to some function reference
        expect(JSON.stringify(res)).toBe(JSON.stringify(expectation));
    });
});
