// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IViewSettingsState, ViewSettingsActionTypes, viewSettingsReducer, ViewType} from './viewSettingsReducer';
import {defaultPageSizeOptions, viewSettingsInitialState} from './viewSettingsInitialState';
import {AttributeFormat, RecordFilterCondition, SortOrder} from '_ui/_gqlTypes';

const attributeData = {
    label: 'first',
    format: AttributeFormat.text
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
    });

    test.each(['table', 'list', 'mosaic', 'timeline'])(
        `Action ${ViewSettingsActionTypes.CHANGE_VIEW_TYPE} to %s`,
        viewType => {
            const state = viewSettingsReducer(viewSettingsInitialState, {
                type: ViewSettingsActionTypes.CHANGE_VIEW_TYPE,
                payload: {viewType: viewType as ViewType}
            });
            expect(state.viewType).toEqual(viewType);
        }
    );

    test(`Action ${ViewSettingsActionTypes.ADD_SORT} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                sort: [
                    {
                        attributeId: 'first',
                        order: SortOrder.asc
                    }
                ]
            },
            {
                type: ViewSettingsActionTypes.ADD_SORT,
                payload: {
                    attributeId: 'attributeId',
                    order: SortOrder.desc
                }
            }
        );
        expect(state.sort).toHaveLength(2);
        expect(state.sort).toEqual([
            {
                attributeId: 'first',
                order: SortOrder.asc
            },
            {
                attributeId: 'attributeId',
                order: 'desc'
            }
        ]);
    });

    test(`Action ${ViewSettingsActionTypes.REMOVE_SORT} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                sort: [
                    {
                        attributeId: 'first',
                        order: SortOrder.asc
                    },
                    {
                        attributeId: 'second',
                        order: SortOrder.desc
                    },
                    {
                        attributeId: 'third',
                        order: SortOrder.desc
                    }
                ]
            },
            {
                type: ViewSettingsActionTypes.REMOVE_SORT,
                payload: {
                    attributeId: 'second'
                }
            }
        );
        expect(state.sort).toHaveLength(2);
        expect(state.sort).toEqual([
            {
                attributeId: 'first',
                order: 'asc'
            },
            {
                attributeId: 'third',
                order: 'desc'
            }
        ]);
    });

    test(`Action ${ViewSettingsActionTypes.CHANGE_SORT_ORDER} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                sort: [
                    {
                        attributeId: 'first',
                        order: SortOrder.asc
                    },
                    {
                        attributeId: 'second',
                        order: SortOrder.asc
                    }
                ]
            },
            {
                type: ViewSettingsActionTypes.CHANGE_SORT_ORDER,
                payload: {
                    attributeId: 'first',
                    order: SortOrder.desc
                }
            }
        );
        expect(state.sort).toHaveLength(2);
        expect(state.sort).toEqual([
            {
                attributeId: 'first',
                order: SortOrder.desc
            },
            {
                attributeId: 'second',
                order: SortOrder.asc
            }
        ]);
    });

    describe(`Action ${ViewSettingsActionTypes.MOVE_SORT} test`, () => {
        const initialState: IViewSettingsState = {
            ...viewSettingsInitialState,
            sort: [
                {order: SortOrder.desc, attributeId: 'test'},
                {order: SortOrder.asc, attributeId: 'active'},
                {order: SortOrder.asc, attributeId: 'created_at'}
            ]
        };

        const cases = [
            {
                indexFrom: 0,
                indexTo: 2,
                expected: [
                    {order: SortOrder.asc, attributeId: 'active'},
                    {order: SortOrder.asc, attributeId: 'created_at'},
                    {order: SortOrder.desc, attributeId: 'test'}
                ]
            },
            {
                indexFrom: 2,
                indexTo: 0,
                expected: [
                    {order: SortOrder.asc, attributeId: 'created_at'},
                    {order: SortOrder.desc, attributeId: 'test'},
                    {order: SortOrder.asc, attributeId: 'active'}
                ]
            },
            {
                indexFrom: 2,
                indexTo: 1,
                expected: [
                    {order: SortOrder.desc, attributeId: 'test'},
                    {order: SortOrder.asc, attributeId: 'created_at'},
                    {order: SortOrder.asc, attributeId: 'active'}
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
                                id: 'id',
                                attribute: attributeData,
                                field: 'first',
                                condition: RecordFilterCondition.EQUAL,
                                value: 'test'
                            }
                        ]
                    },
                    {
                        type: ViewSettingsActionTypes.ADD_FILTER,
                        payload: {
                            attribute: attributeData,
                            field: 'second'
                        }
                    }
                );
                expect(state.filters).toHaveLength(2);
                expect(state.filters).toEqual([
                    {
                        id: 'id',
                        attribute: attributeData,
                        field: 'first',
                        condition: RecordFilterCondition.EQUAL,
                        value: 'test'
                    },
                    {
                        id: expect.any(String),
                        attribute: attributeData,
                        field: 'second',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    }
                ]);
            });
            test('when limit is reach', () => {
                const state = viewSettingsReducer(
                    {
                        ...viewSettingsInitialState,
                        maxFilters: 2,
                        canAddFilter: false,
                        filters: [
                            {
                                id: 'id',
                                attribute: attributeData,
                                field: 'first',
                                condition: RecordFilterCondition.EQUAL,
                                value: null
                            },
                            {
                                id: 'second-id',
                                attribute: attributeData,
                                field: 'second',
                                condition: RecordFilterCondition.EQUAL,
                                value: 'test'
                            }
                        ]
                    },
                    {
                        type: ViewSettingsActionTypes.ADD_FILTER,
                        payload: {
                            attribute: attributeData,
                            field: 'third'
                        }
                    }
                );
                expect(state.filters).toHaveLength(2);
                expect(state.filters).toEqual([
                    {
                        id: 'id',
                        attribute: attributeData,
                        field: 'first',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'second-id',
                        attribute: attributeData,
                        field: 'second',
                        condition: RecordFilterCondition.EQUAL,
                        value: 'test'
                    }
                ]);
            });
        });

        describe('canAddFilter flag', () => {
            test('update to false when ADD_FILTER is called', () => {
                const state = viewSettingsReducer(
                    {
                        ...viewSettingsInitialState,
                        maxFilters: 2,
                        filters: [
                            {
                                id: 'id',
                                attribute: attributeData,
                                field: 'first',
                                condition: RecordFilterCondition.EQUAL,
                                value: 'test'
                            }
                        ]
                    },
                    {
                        type: ViewSettingsActionTypes.ADD_FILTER,
                        payload: {
                            attribute: attributeData,
                            field: 'second'
                        }
                    }
                );
                expect(state.filters).toHaveLength(2);
                expect(state.canAddFilter).toEqual(false);
            });
            test('update to true when REMOVE_FILTER is called', () => {
                const state = viewSettingsReducer(
                    {
                        ...viewSettingsInitialState,
                        maxFilters: 2,
                        canAddFilter: false,
                        filters: [
                            {
                                id: 'id',
                                attribute: attributeData,
                                field: 'first',
                                condition: RecordFilterCondition.EQUAL,
                                value: null
                            },
                            {
                                id: 'second-id',
                                attribute: attributeData,
                                field: 'second',
                                condition: RecordFilterCondition.EQUAL,
                                value: 'test'
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
                expect(state.filters).toHaveLength(1);
                expect(state.canAddFilter).toEqual(true);
            });
        });
    });

    test(`Action ${ViewSettingsActionTypes.RESET_FILTER} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                filters: [
                    {
                        id: 'id',
                        attribute: attributeData,
                        field: 'first',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'second-id',
                        attribute: attributeData,
                        field: 'second',
                        condition: RecordFilterCondition.CONTAINS,
                        value: '42'
                    },
                    {
                        id: 'third-id',
                        attribute: attributeData,
                        field: 'third',
                        condition: RecordFilterCondition.EQUAL,
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
                attribute: attributeData,
                field: 'first',
                condition: RecordFilterCondition.EQUAL,
                value: null
            },
            {
                id: 'second-id',
                attribute: attributeData,
                field: 'second',
                condition: RecordFilterCondition.EQUAL,
                value: null
            },
            {
                id: 'third-id',
                attribute: attributeData,
                field: 'third',
                condition: RecordFilterCondition.EQUAL,
                value: null
            }
        ]);
    });

    test(`Action ${ViewSettingsActionTypes.REMOVE_FILTER} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                filters: [
                    {
                        id: 'id',
                        attribute: attributeData,
                        field: 'first',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'second-id',
                        attribute: attributeData,
                        field: 'second',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'third-id',
                        attribute: attributeData,
                        field: 'third',
                        condition: RecordFilterCondition.EQUAL,
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
                attribute: attributeData,
                field: 'first',
                condition: RecordFilterCondition.EQUAL,
                value: null
            },
            {
                id: 'third-id',
                attribute: attributeData,
                field: 'third',
                condition: RecordFilterCondition.EQUAL,
                value: null
            }
        ]);
    });

    test(`Action ${ViewSettingsActionTypes.CHANGE_FILTER_CONFIG} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                filters: [
                    {
                        id: 'id',
                        attribute: attributeData,
                        field: 'first',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'second-id',
                        attribute: attributeData,
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
                    attribute: attributeData,
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
                attribute: attributeData,
                field: 'first',
                condition: RecordFilterCondition.LESS_THAN,
                value: null
            },
            {
                id: 'second-id',
                attribute: attributeData,
                field: 'second',
                condition: RecordFilterCondition.EQUAL,
                value: null
            }
        ]);
    });

    describe(`Action ${ViewSettingsActionTypes.MOVE_FILTER} test`, () => {
        const initialState: IViewSettingsState = {
            ...viewSettingsInitialState,
            filters: [
                {
                    id: 'id',
                    attribute: attributeData,
                    field: 'test',
                    condition: RecordFilterCondition.EQUAL,
                    value: null
                },
                {
                    id: 'active-id',
                    attribute: attributeData,
                    field: 'active',
                    condition: RecordFilterCondition.EQUAL,
                    value: null
                },
                {
                    id: 'created_at-id',
                    attribute: attributeData,
                    field: 'created_at',
                    condition: RecordFilterCondition.EQUAL,
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
                        attribute: attributeData,
                        field: 'active',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'created_at-id',
                        attribute: attributeData,
                        field: 'created_at',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'id',
                        attribute: attributeData,
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
                        attribute: attributeData,
                        field: 'created_at',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'id',
                        attribute: attributeData,
                        field: 'test',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'active-id',
                        attribute: attributeData,
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
                        attribute: attributeData,
                        field: 'test',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'created_at-id',
                        attribute: attributeData,
                        field: 'created_at',
                        condition: RecordFilterCondition.EQUAL,
                        value: null
                    },
                    {
                        id: 'active-id',
                        attribute: attributeData,
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
        });
    });

    test(`Action ${ViewSettingsActionTypes.RESET} test`, async () => {
        const newState = {
            ...viewSettingsInitialState,
            pageSize: 42,
            filters: [
                {
                    id: 'id',
                    attribute: attributeData,
                    field: 'first',
                    condition: RecordFilterCondition.EQUAL,
                    value: null
                }
            ],
            sort: [
                {
                    attributeId: 'first',
                    order: SortOrder.asc
                }
            ],
            fulltextSearch: 'test',
            attributesIds: ['first'],
            viewType: 'table' as ViewType,
            canAddFilter: true,
            maxFilters: 2
        };

        const state = viewSettingsReducer(viewSettingsInitialState, {
            type: ViewSettingsActionTypes.RESET,
            payload: newState
        });

        expect(state).toEqual(newState);
    });
});
