import {AttributeFormat, AttributeType, RecordFilterCondition} from '_ui/_gqlTypes';
import {ThroughConditionFilter} from '_ui/types';
import {FiltersActionTypes, filtersReducer as filtersReducerBase, type IUIFiltersState} from './filtersReducer';
import {filtersInitialState} from './filtersInitialState';

const attributeDataStandard = {
    label: 'first',
    id: 'first',
    format: AttributeFormat.text,
    type: AttributeType.simple,
};
const attributeDataLink = {
    label: 'first',
    id: 'first',
    linkedLibrary: {id: 'toto'},
    type: AttributeType.simple_link,
};
const attributeDataThrough = {
    label: 'first',
    id: 'first',
    linkedLibrary: {id: 'toto'},
    type: AttributeType.simple_link,
};
const attributeDataTree = {
    label: 'tree',
    format: AttributeFormat.text,
    id: 'tree',
    linkedTree: {id: 'tree_id'},
    type: AttributeType.tree,
};

const filtersReducer = filtersReducerBase(null);

describe('ViewSettings Reducer', () => {
    describe(`Action ${FiltersActionTypes.ADD_FILTER} test`, () => {
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
                            value: 'test',
                        },
                        {
                            id: 'id2',
                            attribute: attributeDataLink,
                            field: 'second',
                            condition: RecordFilterCondition.EQUAL,
                            value: 'test',
                        },
                        {
                            id: 'id3',
                            attribute: attributeDataThrough,
                            field: 'third',
                            condition: ThroughConditionFilter.THROUGH,
                            subField: 'thirdSub',
                            subCondition: null,
                            value: 'test',
                        },
                    ],
                },
                {
                    type: FiltersActionTypes.ADD_FILTER,
                    payload: {
                        attribute: attributeDataStandard,
                        field: 'fourth',
                    },
                },
            );
            expect(state.filters).toHaveLength(4);
            expect(state.filters).toEqual([
                {
                    id: 'id1',
                    attribute: attributeDataStandard,
                    field: 'first',
                    condition: RecordFilterCondition.EQUAL,
                    value: 'test',
                },
                {
                    id: 'id2',
                    attribute: attributeDataLink,
                    field: 'second',
                    condition: RecordFilterCondition.EQUAL,
                    value: 'test',
                },
                {
                    id: 'id3',
                    attribute: attributeDataThrough,
                    field: 'third',
                    condition: ThroughConditionFilter.THROUGH,
                    subField: 'thirdSub',
                    subCondition: null,
                    value: 'test',
                },
                {
                    id: expect.any(String),
                    attribute: attributeDataStandard,
                    field: 'fourth',
                    condition: RecordFilterCondition.CONTAINS,
                    value: null,
                },
            ]);
        });

        test('should add filter with default values from initialFilters when attribute matches', () => {
            const initialViewFilterValue = 'default value';
            const state = filtersReducer(
                {
                    ...filtersInitialState,
                    filters: [
                        {
                            id: 'id1',
                            attribute: attributeDataTree,
                            field: 'first',
                            condition: RecordFilterCondition.EQUAL,
                            value: 'test',
                        },
                    ],
                    initialFilters: [
                        {
                            id: 'initial-id',
                            attribute: attributeDataTree,
                            field: 'second',
                            condition: RecordFilterCondition.EQUAL,
                            value: initialViewFilterValue,
                        },
                    ],
                },
                {
                    type: FiltersActionTypes.ADD_FILTER,
                    payload: {
                        attribute: attributeDataTree,
                        field: 'second',
                    },
                },
            );

            expect(state.filters).toHaveLength(2);
            expect(state.filters[1]).toEqual({
                id: 'initial-id',
                attribute: attributeDataTree,
                field: 'second',
                condition: RecordFilterCondition.EQUAL,
                value: initialViewFilterValue,
                withEmptyValues: true,
            });
        });
    });

    describe(`Action ${FiltersActionTypes.SET_FILTERS} test`, () => {
        test('should set filters from payload', () => {
            const setFiltersPayload = [
                {
                    id: 'id4',
                    attribute: attributeDataStandard,
                    field: 'first',
                    condition: RecordFilterCondition.EQUAL,
                    value: 'test',
                },
                {
                    id: 'id5',
                    attribute: attributeDataLink,
                    field: 'second',
                    condition: RecordFilterCondition.EQUAL,
                    value: 'test',
                },
            ];

            const state = filtersReducer(
                {
                    ...filtersInitialState,
                    filters: [
                        {
                            id: 'id1',
                            attribute: attributeDataStandard,
                            field: 'first',
                            condition: RecordFilterCondition.EQUAL,
                            value: 'test',
                        },
                        {
                            id: 'id2',
                            attribute: attributeDataLink,
                            field: 'second',
                            condition: RecordFilterCondition.EQUAL,
                            value: 'test',
                        },
                        {
                            id: 'id3',
                            attribute: attributeDataThrough,
                            field: 'third',
                            condition: ThroughConditionFilter.THROUGH,
                            subField: 'thirdSub',
                            subCondition: null,
                            value: 'test',
                        },
                    ],
                },
                {
                    type: FiltersActionTypes.SET_FILTERS,
                    payload: setFiltersPayload,
                },
            );
            expect(state.filters).toHaveLength(setFiltersPayload.length);
            expect(state.filters).toEqual(setFiltersPayload);
        });
    });

    describe(`Action ${FiltersActionTypes.SET_FILTERS_AND_OPERATOR} test`, () => {
        test('should replace filters and filtersOperator from payload', () => {
            const newFilters = [
                {
                    id: 'id4',
                    attribute: attributeDataStandard,
                    field: 'first',
                    condition: RecordFilterCondition.EQUAL,
                    value: 'test',
                },
            ];

            const state = filtersReducer(
                {
                    ...filtersInitialState,
                    filtersOperator: 'AND',
                    filters: [
                        {
                            id: 'id1',
                            attribute: attributeDataStandard,
                            field: 'first',
                            condition: RecordFilterCondition.EQUAL,
                            value: 'test',
                        },
                    ],
                },
                {
                    type: FiltersActionTypes.SET_FILTERS_AND_OPERATOR,
                    payload: {filters: newFilters, filtersOperator: 'OR'},
                },
            );

            expect(state.filters).toEqual(newFilters);
            expect(state.filtersOperator).toEqual('OR');
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
                            value: null,
                            formattedValue: null,
                        },
                        {
                            id: 'second-id',
                            attribute: attributeDataLink,
                            field: 'second',
                            condition: RecordFilterCondition.CONTAINS,
                            value: '42',
                            formattedValue: null,
                        },
                        {
                            id: 'third-id',
                            attribute: attributeDataThrough,
                            field: 'third',
                            condition: ThroughConditionFilter.THROUGH,
                            subField: 'thirdSub',
                            subCondition: RecordFilterCondition.NOT_EQUAL,
                            value: null,
                            formattedValue: null,
                        },
                    ],
                },
                {
                    type: FiltersActionTypes.RESET_FILTER,
                    payload: {
                        id: 'second-id',
                    },
                },
            );
            expect(state.filters).toHaveLength(3);
            expect(state.filters).toEqual([
                {
                    id: 'id',
                    attribute: attributeDataStandard,
                    field: 'first',
                    condition: RecordFilterCondition.EQUAL,
                    value: null,
                    formattedValue: null,
                },
                {
                    id: 'second-id',
                    attribute: attributeDataLink,
                    field: 'second',
                    condition: RecordFilterCondition.CONTAINS,
                    value: null,
                    formattedValue: null,
                },
                {
                    id: 'third-id',
                    attribute: attributeDataThrough,
                    field: 'third',
                    condition: ThroughConditionFilter.THROUGH,
                    subField: 'thirdSub',
                    subCondition: RecordFilterCondition.NOT_EQUAL,
                    value: null,
                    formattedValue: null,
                },
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
                            value: userFilterValue,
                        },
                    ],
                    initialFilters: [
                        {
                            id: 'first-id',
                            attribute: attributeDataStandard,
                            field: 'second',
                            condition: RecordFilterCondition.NOT_CONTAINS,
                            value: initialViewFilterValue,
                        },
                    ],
                },
                {
                    type: FiltersActionTypes.RESET_FILTER,
                    payload: {
                        id: 'first-id',
                    },
                },
            );

            expect(state.filters).toEqual([
                {
                    id: 'first-id',
                    attribute: attributeDataStandard,
                    field: 'second',
                    condition: RecordFilterCondition.NOT_CONTAINS,
                    value: initialViewFilterValue,
                },
            ]);
        });

        test('Reset a tree filter clears withEmptyValues, formattedValue and the node selection', () => {
            const state = filtersReducer(
                {
                    ...filtersInitialState,
                    filters: [
                        {
                            id: 'tree-id',
                            attribute: attributeDataTree,
                            field: 'tree',
                            condition: RecordFilterCondition.EQUAL,
                            value: ['rec1'],
                            nodes: [{nodeId: 'node1', libraryId: 'lib'}],
                            userNodes: [{nodeId: 'node1', libraryId: 'lib'}],
                            userFormattedValue: ['Node 1'],
                            formattedValue: ['Node 1'],
                            withEmptyValues: true,
                            includeHiddenOptions: true,
                        },
                    ],
                },
                {
                    type: FiltersActionTypes.RESET_FILTER,
                    payload: {id: 'tree-id'},
                },
            );

            expect(state.filters[0]).toMatchObject({
                id: 'tree-id',
                condition: null,
                value: null,
                nodes: null,
                userNodes: null,
                userFormattedValue: null,
                formattedValue: null,
                withEmptyValues: false,
                includeHiddenOptions: false,
            });
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
                        value: null,
                    },
                    {
                        id: 'second-id',
                        attribute: attributeDataLink,
                        field: 'second',
                        condition: RecordFilterCondition.EQUAL,
                        value: null,
                    },
                    {
                        id: 'third-id',
                        attribute: attributeDataThrough,
                        field: 'third',
                        condition: ThroughConditionFilter.THROUGH,
                        subField: 'thirdSub',
                        subCondition: null,
                        value: null,
                    },
                ],
            },
            {
                type: FiltersActionTypes.REMOVE_FILTER,
                payload: {
                    id: 'second-id',
                },
            },
        );
        expect(state.filters).toHaveLength(2);
        expect(state.filters).toEqual([
            {
                id: 'id',
                attribute: attributeDataStandard,
                field: 'first',
                condition: RecordFilterCondition.EQUAL,
                value: null,
            },
            {
                id: 'third-id',
                attribute: attributeDataThrough,
                field: 'third',
                condition: ThroughConditionFilter.THROUGH,
                subField: 'thirdSub',
                subCondition: null,
                value: null,
            },
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
                        value: null,
                    },
                    {
                        id: 'second-id',
                        attribute: attributeDataLink,
                        field: 'second',
                        condition: RecordFilterCondition.EQUAL,
                        value: null,
                    },
                ],
            },
            {
                type: FiltersActionTypes.CHANGE_FILTER_CONFIG,
                payload: {
                    id: 'id',
                    attribute: attributeDataStandard,
                    field: 'first',
                    condition: RecordFilterCondition.LESS_THAN,
                    value: null,
                },
            },
        );
        expect(state.filters).toHaveLength(2);
        expect(state.filters).toEqual([
            {
                id: 'id',
                attribute: attributeDataStandard,
                field: 'first',
                condition: RecordFilterCondition.LESS_THAN,
                value: null,
            },
            {
                id: 'second-id',
                attribute: attributeDataLink,
                field: 'second',
                condition: RecordFilterCondition.EQUAL,
                value: null,
            },
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
                        value: null,
                        withEmptyValues: false,
                    },
                    {
                        id: 'second-id',
                        attribute: attributeDataLink,
                        field: 'second',
                        condition: RecordFilterCondition.EQUAL,
                        value: null,
                        withEmptyValues: false,
                    },
                ],
            },
            {
                type: FiltersActionTypes.CHANGE_FILTER_CONFIG,
                payload: {
                    id: 'id',
                    attribute: attributeDataStandard,
                    field: 'first',
                    condition: RecordFilterCondition.EQUAL,
                    value: null,
                    withEmptyValues: true,
                },
            },
        );
        expect(state.filters).toHaveLength(2);
        expect(state.filters).toEqual([
            {
                id: 'id',
                attribute: attributeDataStandard,
                field: 'first',
                condition: RecordFilterCondition.EQUAL,
                value: null,
                withEmptyValues: true,
            },
            {
                id: 'second-id',
                attribute: attributeDataLink,
                field: 'second',
                condition: RecordFilterCondition.EQUAL,
                value: null,
                withEmptyValues: false,
            },
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
                    value: null,
                },
                {
                    id: 'active-id',
                    attribute: attributeDataLink,
                    field: 'active',
                    condition: RecordFilterCondition.EQUAL,
                    value: null,
                },
                {
                    id: 'created_at-id',
                    attribute: attributeDataThrough,
                    field: 'created_at',
                    condition: ThroughConditionFilter.THROUGH,
                    subField: 'created_atSub',
                    subCondition: null,
                    value: null,
                },
            ],
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
                        value: null,
                    },
                    {
                        id: 'created_at-id',
                        attribute: attributeDataThrough,
                        field: 'created_at',
                        condition: ThroughConditionFilter.THROUGH,
                        subField: 'created_atSub',
                        subCondition: null,
                        value: null,
                    },
                    {
                        id: 'id',
                        attribute: attributeDataStandard,
                        field: 'test',
                        condition: RecordFilterCondition.EQUAL,
                        value: null,
                    },
                ],
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
                        value: null,
                    },
                    {
                        id: 'id',
                        attribute: attributeDataStandard,
                        field: 'test',
                        condition: RecordFilterCondition.EQUAL,
                        value: null,
                    },
                    {
                        id: 'active-id',
                        attribute: attributeDataLink,
                        field: 'active',
                        condition: RecordFilterCondition.EQUAL,
                        value: null,
                    },
                ],
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
                        value: null,
                    },
                    {
                        id: 'created_at-id',
                        attribute: attributeDataThrough,
                        field: 'created_at',
                        condition: ThroughConditionFilter.THROUGH,
                        subField: 'created_atSub',
                        subCondition: null,
                        value: null,
                    },
                    {
                        id: 'active-id',
                        attribute: attributeDataLink,
                        field: 'active',
                        condition: RecordFilterCondition.EQUAL,
                        value: null,
                    },
                ],
            },
            {
                indexFrom: 0,
                indexTo: 0,
                expected: initialState.filters,
            },
        ];

        test.each(cases)('Move filter from $indexFrom to $indexTo', ({indexFrom, indexTo, expected}) => {
            const state = filtersReducer(initialState, {
                type: FiltersActionTypes.MOVE_FILTER,
                payload: {indexFrom, indexTo},
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
                    value: null,
                },
            ],
        };

        const state = filtersReducer(filtersInitialState, {
            type: FiltersActionTypes.RESET,
            payload: newState,
        });

        expect(state).toEqual(newState);
    });
});
