// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, AttributeType, RecordFilterCondition} from '_ui/_gqlTypes';
import {ThroughConditionFilter} from '_ui/types';
import {FiltersActionTypes, filtersReducer as filtersReducerBase, type IUIFiltersState} from './filtersReducer';
import {filtersInitialState} from './filtersInitialState';

const attributeDataStandard = {
    label: 'first',
    id: 'first',
    format: AttributeFormat.text,
    type: AttributeType.simple
};
const attributeDataLink = {
    label: 'first',
    id: 'first',
    linkedLibrary: {id: 'toto'},
    type: AttributeType.simple_link
};
const attributeDataThrough = {
    label: 'first',
    id: 'first',
    linkedLibrary: {id: 'toto'},
    type: AttributeType.simple_link
};

const filtersReducer = filtersReducerBase(null);

describe('ViewSettings Reducer', () => {
    describe(`Action ${FiltersActionTypes.ADD_FILTER} test`, () => {
        describe('adding filters', () => {
            test('can add new filter', () => {
                const state = filtersReducer(
                    {
                        ...filtersInitialState,
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
                        type: FiltersActionTypes.ADD_FILTER,
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
            });
        });
    });

    describe(`Action ${FiltersActionTypes.RESET_FILTER} test`, () => {
        test('Reset to empty filter', () => {
            const state = filtersReducer(
                {
                    ...filtersInitialState,
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
                    type: FiltersActionTypes.RESET_FILTER,
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
        });

        test('Reset filter to initial view settings', async () => {
            const userFilterValue = '42';
            const initialViewFilterValue = 'View value';
            const state = filtersReducer(
                {
                    ...filtersInitialState,
                    filters: [
                        {
                            id: 'first-id',
                            attribute: attributeDataStandard,
                            field: 'second',
                            condition: RecordFilterCondition.CONTAINS,
                            value: userFilterValue
                        }
                    ],
                    initialFilters: [
                        {
                            id: 'first-id',
                            attribute: attributeDataStandard,
                            field: 'second',
                            condition: RecordFilterCondition.NOT_CONTAINS,
                            value: initialViewFilterValue
                        }
                    ]
                },
                {
                    type: FiltersActionTypes.RESET_FILTER,
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
        });
    });

    test(`Action ${FiltersActionTypes.REMOVE_FILTER} test`, () => {
        const state = filtersReducer(
            {
                ...filtersInitialState,
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
                type: FiltersActionTypes.REMOVE_FILTER,
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
    });

    test(`Action ${FiltersActionTypes.CHANGE_FILTER_CONFIG} test`, () => {
        const state = filtersReducer(
            {
                ...filtersInitialState,
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
                type: FiltersActionTypes.CHANGE_FILTER_CONFIG,
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
    });

    describe(`Action ${FiltersActionTypes.MOVE_FILTER} test`, () => {
        const initialState: IUIFiltersState = {
            ...filtersInitialState,
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
            const state = filtersReducer(initialState, {
                type: FiltersActionTypes.MOVE_FILTER,
                payload: {indexFrom, indexTo}
            });
            expect(state.filters).toEqual(expected);
        });
    });

    test(`Action ${FiltersActionTypes.RESET} test`, async () => {
        const newState = {
            ...filtersInitialState,
            filters: [
                {
                    id: 'id',
                    attribute: attributeDataStandard,
                    field: 'first',
                    condition: RecordFilterCondition.EQUAL,
                    value: null
                }
            ]
        };

        const state = filtersReducer(filtersInitialState, {
            type: FiltersActionTypes.RESET,
            payload: newState
        });

        expect(state).toEqual(newState);
    });
});
