// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IViewSettingsState, ViewSettingsActionTypes, viewSettingsReducer, ViewType} from './viewSettingsReducer';
import {defaultPageSizeOptions, viewSettingsInitialState} from './viewSettingsInitialState';
import {AttributeFormat, AttributeType, RecordFilterCondition, SortOrder} from '_ui/_gqlTypes';
import {ThroughConditionFilter} from '_ui/types';

const attributeDataStandard = {
    label: 'first',
    format: AttributeFormat.text,
    type: AttributeType.simple
};
const attributeDataLink = {
    label: 'first',
    linkedLibrary: {id: 'toto'},
    type: AttributeType.simple_link
};
const attributeDataThrough = {
    label: 'first',
    linkedLibrary: {id: 'toto'},
    type: AttributeType.simple_link
};

describe('ViewSettings Reducer', () => {
    describe(`Action ${ViewSettingsActionTypes.CHANGE_PAGE_SIZE}`, () => {
        test('default value should be the first of defaultPageSizeOptions', () => {
            expect(viewSettingsInitialState.pageSize).toEqual(defaultPageSizeOptions[0]);
        });

        test('if the action can modify the pageSize', () => {
            const state = viewSettingsReducer(viewSettingsInitialState, {
                type: ViewSettingsActionTypes.CHANGE_PAGE_SIZE,
                payload: {
                    pageSize: 42
                }
            });
            expect(state.pageSize).toEqual(42);
        });
    });

    test(`Action ${ViewSettingsActionTypes.ADD_ATTRIBUTE} test`, () => {
        const state = viewSettingsReducer(viewSettingsInitialState, {
            type: ViewSettingsActionTypes.ADD_ATTRIBUTE,
            payload: {attributeId: 'test'}
        });
        expect(state.attributesIds).toEqual(['test']);
        expect(state.viewModified).toEqual(true);
    });

    test(`Action ${ViewSettingsActionTypes.REMOVE_ATTRIBUTE} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                attributesIds: ['test', 'active', 'created_at']
            },
            {
                type: ViewSettingsActionTypes.REMOVE_ATTRIBUTE,
                payload: {attributeId: 'test'}
            }
        );
        expect(state.attributesIds).toEqual(['active', 'created_at']);
        expect(state.viewModified).toEqual(true);
    });

    describe(`Action ${ViewSettingsActionTypes.MOVE_ATTRIBUTE} test`, () => {
        const initialState: IViewSettingsState = {
            ...viewSettingsInitialState,
            attributesIds: ['test', 'active', 'created_at']
        };

        const cases = [
            {
                indexFrom: 0,
                indexTo: 2,
                expected: ['active', 'created_at', 'test']
            },
            {
                indexFrom: 2,
                indexTo: 0,
                expected: ['created_at', 'test', 'active']
            },
            {
                indexFrom: 2,
                indexTo: 1,
                expected: ['test', 'created_at', 'active']
            },
            {
                indexFrom: 0,
                indexTo: 0,
                expected: initialState.attributesIds
            }
        ];

        test.each(cases)('Move attribute from $indexFrom to $indexTo', ({indexFrom, indexTo, expected}) => {
            const state = viewSettingsReducer(initialState, {
                type: ViewSettingsActionTypes.MOVE_ATTRIBUTE,
                payload: {indexFrom, indexTo}
            });
            expect(state.attributesIds).toEqual(expected);
            expect(state.viewModified).toEqual(true);
        });
    });

    test(`Action ${ViewSettingsActionTypes.RESET_ATTRIBUTES} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                attributesIds: ['test', 'active', 'created_at']
            },
            {
                type: ViewSettingsActionTypes.RESET_ATTRIBUTES
            }
        );
        expect(state.attributesIds).toEqual([]);
        expect(state.viewModified).toEqual(false);
    });

    test.each(['table', 'list', 'mosaic', 'timeline'])(
        `Action ${ViewSettingsActionTypes.CHANGE_VIEW_TYPE} to %s`,
        viewType => {
            const state = viewSettingsReducer(viewSettingsInitialState, {
                type: ViewSettingsActionTypes.CHANGE_VIEW_TYPE,
                payload: {viewType: viewType as ViewType}
            });
            expect(state.viewType).toEqual(viewType);
            expect(state.viewModified).toEqual(true);
        }
    );

    test(`Action ${ViewSettingsActionTypes.ADD_SORT} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                sort: [
                    {
                        field: 'first',
                        order: SortOrder.asc
                    }
                ]
            },
            {
                type: ViewSettingsActionTypes.ADD_SORT,
                payload: {
                    field: 'attributeId',
                    order: SortOrder.desc
                }
            }
        );
        expect(state.sort).toHaveLength(2);
        expect(state.sort).toEqual([
            {
                field: 'first',
                order: SortOrder.asc
            },
            {
                field: 'attributeId',
                order: 'desc'
            }
        ]);
        expect(state.viewModified).toEqual(true);
    });

    test(`Action ${ViewSettingsActionTypes.REMOVE_SORT} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                sort: [
                    {
                        field: 'first',
                        order: SortOrder.asc
                    },
                    {
                        field: 'second',
                        order: SortOrder.desc
                    },
                    {
                        field: 'third',
                        order: SortOrder.desc
                    }
                ]
            },
            {
                type: ViewSettingsActionTypes.REMOVE_SORT,
                payload: {
                    field: 'second'
                }
            }
        );
        expect(state.sort).toHaveLength(2);
        expect(state.sort).toEqual([
            {
                field: 'first',
                order: 'asc'
            },
            {
                field: 'third',
                order: 'desc'
            }
        ]);
        expect(state.viewModified).toEqual(true);
    });

    test(`Action ${ViewSettingsActionTypes.CHANGE_SORT_ORDER} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                sort: [
                    {
                        field: 'first',
                        order: SortOrder.asc
                    },
                    {
                        field: 'second',
                        order: SortOrder.asc
                    }
                ]
            },
            {
                type: ViewSettingsActionTypes.CHANGE_SORT_ORDER,
                payload: {
                    field: 'first',
                    order: SortOrder.desc
                }
            }
        );
        expect(state.sort).toHaveLength(2);
        expect(state.sort).toEqual([
            {
                field: 'first',
                order: SortOrder.desc
            },
            {
                field: 'second',
                order: SortOrder.asc
            }
        ]);
        expect(state.viewModified).toEqual(true);
    });

    describe(`Action ${ViewSettingsActionTypes.MOVE_SORT} test`, () => {
        const initialState: IViewSettingsState = {
            ...viewSettingsInitialState,
            sort: [
                {order: SortOrder.desc, field: 'test'},
                {order: SortOrder.asc, field: 'active'},
                {order: SortOrder.asc, field: 'created_at'}
            ]
        };

        const cases = [
            {
                indexFrom: 0,
                indexTo: 2,
                expected: [
                    {order: SortOrder.asc, field: 'active'},
                    {order: SortOrder.asc, field: 'created_at'},
                    {order: SortOrder.desc, field: 'test'}
                ]
            },
            {
                indexFrom: 2,
                indexTo: 0,
                expected: [
                    {order: SortOrder.asc, field: 'created_at'},
                    {order: SortOrder.desc, field: 'test'},
                    {order: SortOrder.asc, field: 'active'}
                ]
            },
            {
                indexFrom: 2,
                indexTo: 1,
                expected: [
                    {order: SortOrder.desc, field: 'test'},
                    {order: SortOrder.asc, field: 'created_at'},
                    {order: SortOrder.asc, field: 'active'}
                ]
            },
            {
                indexFrom: 0,
                indexTo: 0,
                expected: initialState.sort
            }
        ];

        test.each(cases)('Move sort from $indexFrom to $indexTo', ({indexFrom, indexTo, expected}) => {
            const state = viewSettingsReducer(initialState, {
                type: ViewSettingsActionTypes.MOVE_SORT,
                payload: {indexFrom, indexTo}
            });
            expect(state.sort).toEqual(expected);
            expect(state.viewModified).toEqual(true);
        });
    });

    describe(`Action ${ViewSettingsActionTypes.ADD_FILTER} test`, () => {
        describe('adding filters', () => {
            test('can add new filter', () => {
                const state = viewSettingsReducer(
                    {
                        ...viewSettingsInitialState,
                        filters: [
                            {
                                id: 'id1',
                                attribute: attributeDataStandard,
                                field: 'first',
                                condition: RecordFilterCondition.EQUAL,
                                value: 'test'
                            },
                            {
                                id: 'id2',
                                attribute: attributeDataLink,
                                field: 'second',
                                condition: RecordFilterCondition.EQUAL,
                                value: 'test'
                            },
                            {
                                id: 'id3',
                                attribute: attributeDataThrough,
                                field: 'third',
                                condition: ThroughConditionFilter.THROUGH,
                                subField: 'thirdSub',
                                subCondition: null,
                                value: 'test'
                            }
                        ]
                    },
                    {
                        type: ViewSettingsActionTypes.ADD_FILTER,
                        payload: {
                            attribute: attributeDataStandard,
                            field: 'fourth'
                        }
                    }
                );
                expect(state.filters).toHaveLength(4);
                expect(state.filters).toEqual([
                    {
                        id: 'id1',
                        attribute: attributeDataStandard,
                        field: 'first',
                        condition: RecordFilterCondition.EQUAL,
                        value: 'test'
                    },
                    {
                        id: 'id2',
                        attribute: attributeDataLink,
                        field: 'second',
                        condition: RecordFilterCondition.EQUAL,
                        value: 'test'
                    },
                    {
                        id: 'id3',
                        attribute: attributeDataThrough,
                        field: 'third',
                        condition: ThroughConditionFilter.THROUGH,
                        subField: 'thirdSub',
                        subCondition: null,
                        value: 'test'
                    },
                    {
                        id: expect.any(String),
                        attribute: attributeDataStandard,
                        field: 'fourth',
                        condition: RecordFilterCondition.CONTAINS,
                        value: null
                    }
                ]);
                expect(state.viewModified).toEqual(true);
            });
        });
    });

    describe(`Action ${ViewSettingsActionTypes.RESET_FILTER} test`, () => {
        test('Reset to empty filter', () => {
            const state = viewSettingsReducer(
                {
                    ...viewSettingsInitialState,
                    filters: [
                        {
                            id: 'id',
                            attribute: attributeDataStandard,
                            field: 'first',
                            condition: RecordFilterCondition.EQUAL,
                            value: null
                        },
                        {
                            id: 'second-id',
                            attribute: attributeDataLink,
                            field: 'second',
                            condition: RecordFilterCondition.CONTAINS,
                            value: '42'
                        },
                        {
                            id: 'third-id',
                            attribute: attributeDataThrough,
                            field: 'third',
                            condition: ThroughConditionFilter.THROUGH,
                            subField: 'thirdSub',
                            subCondition: RecordFilterCondition.NOT_EQUAL,
                            value: null
                        }
                    ]
                },
                {
                    type: ViewSettingsActionTypes.RESET_FILTER,
                    payload: {
                        id: 'second-id'
                    }
                }
            );
            expect(state.filters).toHaveLength(3);
            expect(state.filters).toEqual([
                {
                    id: 'id',
                    attribute: attributeDataStandard,
                    field: 'first',
                    condition: RecordFilterCondition.EQUAL,
                    value: null
                },
                {
                    id: 'second-id',
                    attribute: attributeDataLink,
                    field: 'second',
                    condition: RecordFilterCondition.CONTAINS,
                    value: null
                },
                {
                    id: 'third-id',
                    attribute: attributeDataThrough,
                    field: 'third',
                    condition: ThroughConditionFilter.THROUGH,
                    subField: 'thirdSub',
                    subCondition: RecordFilterCondition.NOT_EQUAL,
                    value: null
                }
            ]);
            expect(state.viewModified).toEqual(false);
        });

        test('Reset filter to initial view settings', async () => {
            const userFilterValue = '42';
            const initialViewFilterValue = 'View value';
            const state = viewSettingsReducer(
                {
                    ...viewSettingsInitialState,
                    filters: [
                        {
                            id: 'first-id',
                            attribute: attributeDataStandard,
                            field: 'second',
                            condition: RecordFilterCondition.CONTAINS,
                            value: userFilterValue
                        }
                    ],
                    initialViewSettings: {
                        ...viewSettingsInitialState.initialViewSettings,
                        filters: [
                            {
                                id: 'first-id',
                                attribute: attributeDataStandard,
                                field: 'second',
                                condition: RecordFilterCondition.NOT_CONTAINS,
                                value: initialViewFilterValue
                            }
                        ]
                    }
                },
                {
                    type: ViewSettingsActionTypes.RESET_FILTER,
                    payload: {
                        id: 'first-id'
                    }
                }
            );

            expect(state.filters).toEqual([
                {
                    id: 'first-id',
                    attribute: attributeDataStandard,
                    field: 'second',
                    condition: RecordFilterCondition.NOT_CONTAINS,
                    value: initialViewFilterValue
                }
            ]);
            expect(state.viewModified).toEqual(false);
        });
    });

    test(`Action ${ViewSettingsActionTypes.REMOVE_FILTER} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                filters: [
                    {
                        id: 'id',
                        attribute: attributeDataStandard,
                        field: 'first',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'second-id',
                        attribute: attributeDataLink,
                        field: 'second',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'third-id',
                        attribute: attributeDataThrough,
                        field: 'third',
                        condition: ThroughConditionFilter.THROUGH,
                        subField: 'thirdSub',
                        subCondition: null,
                        value: null
                    }
                ]
            },
            {
                type: ViewSettingsActionTypes.REMOVE_FILTER,
                payload: {
                    id: 'second-id'
                }
            }
        );
        expect(state.filters).toHaveLength(2);
        expect(state.filters).toEqual([
            {
                id: 'id',
                attribute: attributeDataStandard,
                field: 'first',
                condition: RecordFilterCondition.EQUAL,
                value: null
            },
            {
                id: 'third-id',
                attribute: attributeDataThrough,
                field: 'third',
                condition: ThroughConditionFilter.THROUGH,
                subField: 'thirdSub',
                subCondition: null,
                value: null
            }
        ]);
        expect(state.viewModified).toEqual(true);
    });

    test(`Action ${ViewSettingsActionTypes.CHANGE_FILTER_CONFIG} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                filters: [
                    {
                        id: 'id',
                        attribute: attributeDataStandard,
                        field: 'first',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'second-id',
                        attribute: attributeDataLink,
                        field: 'second',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    }
                ]
            },
            {
                type: ViewSettingsActionTypes.CHANGE_FILTER_CONFIG,
                payload: {
                    id: 'id',
                    attribute: attributeDataStandard,
                    field: 'first',
                    condition: RecordFilterCondition.LESS_THAN,
                    value: null
                }
            }
        );
        expect(state.filters).toHaveLength(2);
        expect(state.filters).toEqual([
            {
                id: 'id',
                attribute: attributeDataStandard,
                field: 'first',
                condition: RecordFilterCondition.LESS_THAN,
                value: null
            },
            {
                id: 'second-id',
                attribute: attributeDataLink,
                field: 'second',
                condition: RecordFilterCondition.EQUAL,
                value: null
            }
        ]);
        expect(state.viewModified).toEqual(true);
    });

    describe(`Action ${ViewSettingsActionTypes.MOVE_FILTER} test`, () => {
        const initialState: IViewSettingsState = {
            ...viewSettingsInitialState,
            filters: [
                {
                    id: 'id',
                    attribute: attributeDataStandard,
                    field: 'test',
                    condition: RecordFilterCondition.EQUAL,
                    value: null
                },
                {
                    id: 'active-id',
                    attribute: attributeDataLink,
                    field: 'active',
                    condition: RecordFilterCondition.EQUAL,
                    value: null
                },
                {
                    id: 'created_at-id',
                    attribute: attributeDataThrough,
                    field: 'created_at',
                    condition: ThroughConditionFilter.THROUGH,
                    subField: 'created_atSub',
                    subCondition: null,
                    value: null
                }
            ]
        };

        const cases = [
            {
                indexFrom: 0,
                indexTo: 2,
                expected: [
                    {
                        id: 'active-id',
                        attribute: attributeDataLink,
                        field: 'active',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'created_at-id',
                        attribute: attributeDataThrough,
                        field: 'created_at',
                        condition: ThroughConditionFilter.THROUGH,
                        subField: 'created_atSub',
                        subCondition: null,
                        value: null
                    },
                    {
                        id: 'id',
                        attribute: attributeDataStandard,
                        field: 'test',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    }
                ]
            },
            {
                indexFrom: 2,
                indexTo: 0,
                expected: [
                    {
                        id: 'created_at-id',
                        attribute: attributeDataThrough,
                        field: 'created_at',
                        condition: ThroughConditionFilter.THROUGH,
                        subField: 'created_atSub',
                        subCondition: null,
                        value: null
                    },
                    {
                        id: 'id',
                        attribute: attributeDataStandard,
                        field: 'test',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'active-id',
                        attribute: attributeDataLink,
                        field: 'active',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    }
                ]
            },
            {
                indexFrom: 2,
                indexTo: 1,
                expected: [
                    {
                        id: 'id',
                        attribute: attributeDataStandard,
                        field: 'test',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'created_at-id',
                        attribute: attributeDataThrough,
                        field: 'created_at',
                        condition: ThroughConditionFilter.THROUGH,
                        subField: 'created_atSub',
                        subCondition: null,
                        value: null
                    },
                    {
                        id: 'active-id',
                        attribute: attributeDataLink,
                        field: 'active',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    }
                ]
            },
            {
                indexFrom: 0,
                indexTo: 0,
                expected: initialState.filters
            }
        ];

        test.each(cases)('Move filter from $indexFrom to $indexTo', ({indexFrom, indexTo, expected}) => {
            const state = viewSettingsReducer(initialState, {
                type: ViewSettingsActionTypes.MOVE_FILTER,
                payload: {indexFrom, indexTo}
            });
            expect(state.filters).toEqual(expected);
            expect(state.viewModified).toEqual(true);
        });
    });

    test(`Action ${ViewSettingsActionTypes.RESET} test`, async () => {
        const newState = {
            ...viewSettingsInitialState,
            pageSize: 42,
            filters: [
                {
                    id: 'id',
                    attribute: attributeDataStandard,
                    field: 'first',
                    condition: RecordFilterCondition.EQUAL,
                    value: null
                }
            ],
            sort: [
                {
                    field: 'first',
                    order: SortOrder.asc
                }
            ],
            fulltextSearch: 'test',
            attributesIds: ['first'],
            viewType: 'table' as ViewType,
            maxFilters: 2
        };

        const state = viewSettingsReducer(viewSettingsInitialState, {
            type: ViewSettingsActionTypes.RESET,
            payload: newState
        });

        expect(state).toEqual(newState);
        expect(state.viewModified).toEqual(false);
    });

    test(`Action ${ViewSettingsActionTypes.RESTORE_INITIAL_VIEW_SETTINGS} test`, async () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                viewType: 'mosaic',
                filters: [
                    {
                        id: '012',
                        attribute: attributeDataStandard,
                        field: 'first',
                        condition: RecordFilterCondition.EQUAL,
                        value: 'first'
                    },
                    {
                        id: '345',
                        attribute: attributeDataLink,
                        field: 'second',
                        condition: RecordFilterCondition.EQUAL,
                        value: 'second'
                    },
                    {
                        id: '678',
                        attribute: attributeDataThrough,
                        field: 'third',
                        condition: ThroughConditionFilter.THROUGH,
                        subField: null,
                        subCondition: null,
                        value: 'third'
                    }
                ],
                sort: [
                    {
                        field: 'first',
                        order: SortOrder.asc
                    }
                ],
                attributesIds: ['firstAttribute', 'secondAttribute', 'thirdAttribute'],
                initialViewSettings: {
                    viewType: viewSettingsInitialState.viewType,
                    filters: viewSettingsInitialState.filters,
                    sort: viewSettingsInitialState.sort,
                    attributesIds: viewSettingsInitialState.attributesIds,
                    pageSize: viewSettingsInitialState.pageSize
                },
                viewModified: true
            },
            {
                type: ViewSettingsActionTypes.RESTORE_INITIAL_VIEW_SETTINGS
            }
        );

        expect(state).toEqual(viewSettingsInitialState);
        expect(state.viewModified).toEqual(false);
    });

    test(`Action ${ViewSettingsActionTypes.SET_SELECTED_KEYS} test`, async () => {
        const newSelectedKeys = ['key1', 'key2', 'key3'];
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                massSelection: ['toBeDeletedKey']
            },
            {
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: newSelectedKeys
            }
        );

        expect(state.massSelection).toEqual(newSelectedKeys);
        expect(state.viewModified).toEqual(false);
    });

    test(`Action ${ViewSettingsActionTypes.UPDATE_VIEWS} test`, async () => {
        const view = {
            id: 'viewId',
            label: {
                fr: 'Ma vue'
            },
            shared: false
        };
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                viewModified: true
            },
            {
                type: ViewSettingsActionTypes.UPDATE_VIEWS,
                payload: view
            }
        );

        expect(state.viewId).toEqual(view.id);
        expect(state.viewLabels).toEqual(view.label);
        expect(state.savedViews.length).toEqual(1);
        expect(state.viewModified).toEqual(false);
    });
});
