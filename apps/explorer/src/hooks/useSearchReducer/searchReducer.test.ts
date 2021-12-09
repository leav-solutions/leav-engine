// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFilterCondition, SortOrder} from '_gqlTypes/globalTypes';
import {AttributeConditionFilter, AttributeType, FilterType} from '_types/types';
import {mockAttribute} from '__mocks__/common/attribute';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import searchReducer, {initialSearchState, SearchActionTypes} from './searchReducer';

describe('searchReducer', () => {
    test('SET_RECORDS', async () => {
        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_RECORDS,
                records: [
                    {
                        whoAmI: {
                            ...mockRecordWhoAmI,
                            id: '123456',
                            label: 'My record'
                        },
                        index: 0,
                        fields: []
                    }
                ]
            }
        );

        expect(newState.records).toHaveLength(1);
        expect(newState.records[0].whoAmI.id).toBe('123456');
    });

    test('SET_TOTAL_COUNT', async () => {
        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_TOTAL_COUNT,
                totalCount: 42
            }
        );

        expect(newState.totalCount).toBe(42);
    });
    test('SET_PAGINATION', async () => {
        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_PAGINATION,
                page: 2
            }
        );

        expect(newState.pagination).toBe(2);
    });

    test('SET_OFFSET', async () => {
        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_OFFSET,
                offset: 50
            }
        );

        expect(newState.offset).toBe(50);
    });

    test('SET_LOADING', async () => {
        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_LOADING,
                loading: true
            }
        );

        expect(newState.loading).toBe(true);
    });

    test('SET_SORT', async () => {
        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_SORT,
                sort: {
                    active: true,
                    order: SortOrder.desc,
                    field: 'label'
                }
            }
        );

        expect(newState.sort).toEqual({
            active: true,
            order: SortOrder.desc,
            field: 'label'
        });
    });

    test('CANCEL_SORT', async () => {
        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.CANCEL_SORT
            }
        );

        expect(newState.sort.active).toBe(false);
    });

    test('SET_ATTRIBUTES', async () => {
        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_ATTRIBUTES,
                attributes: [mockAttribute]
            }
        );

        expect(newState.attributes.length).toBe(1);
        expect(newState.attributes[0].id).toBe(mockAttribute.id);
    });

    test('SET_FIELDS', async () => {
        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_FIELDS,
                fields: [
                    {
                        id: 'field',
                        type: AttributeType.simple,
                        library: 'test',
                        label: 'my field',
                        key: '123456'
                    }
                ]
            }
        );

        expect(newState.fields.length).toBe(1);
        expect(newState.fields[0].id).toBe('field');
    });

    test('SET_FULLTEXT', async () => {
        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_FULLTEXT,
                fullText: 'test'
            }
        );

        expect(newState.fullText).toBe('test');
    });

    test('SET_FILTERS', async () => {
        const filter = {
            type: FilterType.ATTRIBUTE,
            index: 1,
            key: '1',
            value: {value: 'test'},
            active: true,
            condition: AttributeConditionFilter.EQUAL
            // FIXME: missing attribute
        };

        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_FILTERS,
                filters: [filter]
            }
        );

        expect(newState.filters).toEqual(expect.arrayContaining([expect.objectContaining(filter)]));
    });

    test('SET_QUERY_FILTERS', async () => {
        const queryFilter = {
            field: 'id',
            value: '1',
            condition: RecordFilterCondition.EQUAL
        };

        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_QUERY_FILTERS,
                queryFilters: [queryFilter]
            }
        );

        expect(newState.queryFilters).toEqual(expect.arrayContaining([expect.objectContaining(queryFilter)]));
    });
});
