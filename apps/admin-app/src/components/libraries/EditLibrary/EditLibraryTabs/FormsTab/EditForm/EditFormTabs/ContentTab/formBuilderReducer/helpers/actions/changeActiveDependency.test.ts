// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {formBuilderReducer} from '../..';
import {FormElementTypes} from '../../../../../../../../../../../_gqlTypes/globalTypes';
import {layoutElements} from '../../../uiElements/__mocks__';
import {UIElementTypes} from '../../../_types';
import {defaultContainerId, FormBuilderActionTypes} from '../../formBuilderReducer';
import {formElem1, formElem2, formElem3, formElem4, initialState} from '../../_fixtures/fixtures';

describe('formBuilderReducer', () => {
    test('CHANGE_ACTIVE_DEPENDENCY', async () => {
        const newDep = {
            attribute: 'category',
            value: {
                id: '12345',
                label: null,
                color: null,
                preview: null,
                library: {
                    id: 'category',
                    label: null
                }
            },
            ancestors: [
                {
                    id: '12344',
                    label: null,
                    color: null,
                    preview: null,
                    library: {
                        id: 'category',
                        label: null
                    }
                },
                {
                    id: '12343',
                    label: null,
                    color: null,
                    preview: null,
                    library: {
                        id: 'category',
                        label: null
                    }
                }
            ]
        };
        const newState = formBuilderReducer(initialState, {
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
