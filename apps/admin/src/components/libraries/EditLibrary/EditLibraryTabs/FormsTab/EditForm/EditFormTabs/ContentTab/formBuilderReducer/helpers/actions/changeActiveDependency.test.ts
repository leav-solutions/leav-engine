// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {formBuilderReducer} from '../..';
import {FormElementTypes} from '../../../../../../../../../../../_gqlTypes/globalTypes';
import {UIElementTypes} from '../../../_types';
import {layoutElements} from '../../../uiElements/__mocks__';
import {formElem1, formElem2, formElem3, formElem4, mockInitialState} from '../../_fixtures/fixtures';
import {FormBuilderActionTypes, defaultContainerId} from '../../formBuilderReducer';

describe('formBuilderReducer', () => {
    test('CHANGE_ACTIVE_DEPENDENCY', async () => {
        const newDep = {
            attribute: 'category',
            value: {
                id: '987654',
                record: {
                    whoAmI: {
                        id: '12345',
                        label: null,
                        color: null,
                        preview: null,
                        library: {
                            id: 'category',
                            label: null
                        }
                    }
                }
            },
            ancestors: [
                {
                    id: '654320',
                    record: {
                        whoAmI: {
                            id: '12344',
                            label: null,
                            color: null,
                            preview: null,
                            library: {
                                id: 'category',
                                label: null
                            }
                        }
                    }
                },
                {
                    id: '654321',
                    record: {
                        whoAmI: {
                            id: '12343',
                            label: null,
                            color: null,
                            preview: null,
                            library: {
                                id: 'category',
                                label: null
                            }
                        }
                    }
                }
            ]
        };
        const newState = formBuilderReducer(mockInitialState, {
            type: FormBuilderActionTypes.CHANGE_ACTIVE_DEPENDENCY,
            activeDependency: newDep
        });

        expect(newState.activeDependency).toEqual(newDep);
        expect(newState.activeElements).toEqual({
            [defaultContainerId]: [
                {
                    id: '123456',
                    containerId: defaultContainerId,
                    type: FormElementTypes.layout,
                    order: 0,
                    settings: {},
                    uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER],
                    herited: true
                },
                {
                    id: '456',
                    containerId: defaultContainerId,
                    type: FormElementTypes.layout,
                    order: 1,
                    settings: {
                        title: 'divide'
                    },
                    uiElement: layoutElements[UIElementTypes.DIVIDER],
                    herited: true
                },
                {
                    id: '123457',
                    containerId: defaultContainerId,
                    type: FormElementTypes.layout,
                    order: 2,
                    settings: {},
                    uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER],
                    herited: true
                }
            ],
            '123456': [
                {
                    ...formElem1,
                    herited: true
                },
                {
                    ...formElem4,
                    herited: true
                },
                {
                    ...formElem3,
                    herited: false
                }
            ],
            '123457': [
                {
                    ...formElem2,
                    herited: true
                }
            ]
        });
    });
});
