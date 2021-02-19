// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormElementTypes} from '../../../../../../../../../../../_gqlTypes/globalTypes';
import {layoutElements} from '../../../uiElements';
import {UIElementTypes} from '../../../_types';
import {
    defaultContainerId,
    defaultDepAttribute,
    defaultDepValue,
    FormBuilderActionTypes
} from '../../formBuilderReducer';
import {mockInitialState} from '../../_fixtures/fixtures';
import removeTab from './removeTab';

describe('formBuilderReducer', () => {
    describe('REMOVE_TAB', () => {
        const removeTabInitialState = {
            ...mockInitialState,
            elements: {
                [defaultDepAttribute]: {
                    [defaultDepValue]: {
                        [defaultContainerId]: [
                            {
                                id: '1',
                                containerId: defaultContainerId,
                                type: FormElementTypes.layout,
                                order: 0,
                                settings: {
                                    tabs: [
                                        {
                                            label: 'tab 1',
                                            id: '1_1'
                                        },
                                        {
                                            label: 'tab 2',
                                            id: '1_2'
                                        }
                                    ]
                                },
                                uiElement: layoutElements[UIElementTypes.TABS]
                            }
                        ],
                        '1/1_1': [
                            {
                                id: '1_12',
                                containerId: '1/1_1',
                                type: FormElementTypes.layout,
                                order: 2,
                                settings: {},
                                uiElement: layoutElements[UIElementTypes.DIVIDER]
                            }
                        ],
                        '1/1_2': [
                            {
                                id: '1_12',
                                containerId: '1/1_2',
                                type: FormElementTypes.layout,
                                order: 2,
                                settings: {},
                                uiElement: layoutElements[UIElementTypes.DIVIDER]
                            }
                        ]
                    }
                }
            },
            activeElements: {
                [defaultContainerId]: [
                    {
                        id: '1',
                        containerId: defaultContainerId,
                        type: FormElementTypes.layout,
                        order: 0,
                        settings: {
                            tabs: [
                                {
                                    label: 'tab 1',
                                    id: '1_1'
                                },
                                {
                                    label: 'tab 2',
                                    id: '1_2'
                                }
                            ]
                        },
                        uiElement: layoutElements[UIElementTypes.TABS]
                    }
                ],
                '1/1_1': [
                    {
                        id: '1_12',
                        containerId: '1/1_1',
                        type: FormElementTypes.layout,
                        order: 2,
                        settings: {},
                        uiElement: layoutElements[UIElementTypes.DIVIDER]
                    }
                ],
                '1/1_2': [
                    {
                        id: '1_12',
                        containerId: '1/1_2',
                        type: FormElementTypes.layout,
                        order: 2,
                        settings: {},
                        uiElement: layoutElements[UIElementTypes.DIVIDER]
                    }
                ]
            }
        };
        test('Remove a tab', async () => {
            const newState = removeTab(removeTabInitialState, {
                type: FormBuilderActionTypes.REMOVE_TAB,
                parentElement: {
                    id: '1',
                    containerId: defaultContainerId,
                    type: FormElementTypes.layout,
                    order: 0,
                    settings: {
                        tabs: [
                            {
                                label: 'tab 1',
                                id: '1_1'
                            },
                            {
                                label: 'tab 2',
                                id: '1_2'
                            }
                        ]
                    },
                    uiElement: layoutElements[UIElementTypes.TABS]
                },
                tabId: '1_2'
            });

            const newElements = newState.elements[defaultDepAttribute][defaultDepValue];
            const newActiveElements = newState.activeElements;

            // Remove elements linked to this tab
            expect(newElements['1/1_2']).toBeUndefined();
            expect(newActiveElements['1/1_2']).toBeUndefined();

            // Update tabs settings
            expect(newElements[defaultContainerId][0]?.settings?.tabs).toHaveLength(
                removeTabInitialState.elements[defaultDepAttribute][defaultDepValue][defaultContainerId][0].settings
                    .tabs.length - 1
            );
        });
    });
});
