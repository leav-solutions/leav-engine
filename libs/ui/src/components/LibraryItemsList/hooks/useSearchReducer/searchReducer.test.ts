// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeConditionFilter, FilterType, SidebarContentType} from '_ui/types/search';
import {AttributeType, SortOrder} from '_ui/_gqlTypes';
import {mockAttributeSimple} from '_ui/__mocks__/common/attribute';
import {mockLibrarySimple} from '_ui/__mocks__/common/library';
import {mockRecord} from '_ui/__mocks__/common/record';
import searchReducer, {initialSearchState, SearchActionTypes} from './searchReducer';

describe('searchReducer', () => {
    test('UPDATE_RESULT', async () => {
        const newState = searchReducer(
            {...initialSearchState, loading: true},
            {
                type: SearchActionTypes.UPDATE_RESULT,
                records: [
                    {
                        whoAmI: {
                            ...mockRecord,
                            id: '123456',
                            label: 'My record'
                        },
                        index: 0,
                        fields: []
                    }
                ],
                totalCount: 42
            }
        );

        expect(newState.records).toHaveLength(1);
        expect(newState.records[0].whoAmI.id).toBe('123456');
        expect(newState.totalCount).toBe(42);
        expect(newState.loading).toBe(false);
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
                    order: SortOrder.desc,
                    field: 'label'
                }
            }
        );

        expect(newState.sort).toEqual({
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

        expect(newState.sort).toBe(undefined);
    });

    test('SET_ATTRIBUTES', async () => {
        const newState = searchReducer(
            {...initialSearchState},
            {
                type: SearchActionTypes.SET_ATTRIBUTES,
                attributes: [{...mockAttributeSimple, isLink: false, isMultiple: false, library: mockLibrarySimple.id}]
            }
        );

        expect(newState.attributes.length).toBe(1);
        expect(newState.attributes[0].id).toBe(mockAttributeSimple.id);
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

    test('RESET_FILTERS', async () => {
        const newState = searchReducer({...initialSearchState}, {type: SearchActionTypes.RESET_FILTERS});

        expect(newState.filters).toHaveLength(0);
        expect(newState.loading).toBe(true);
    });

    test('DISABLE_FILTERS', async () => {
        const filter = {
            type: FilterType.ATTRIBUTE,
            index: 1,
            key: '1',
            value: {value: 'test'},
            active: true,
            condition: AttributeConditionFilter.EQUAL
        };

        const newState = searchReducer(
            {...initialSearchState, filters: [filter]},
            {type: SearchActionTypes.DISABLE_FILTERS}
        );

        expect(newState.filters).toHaveLength(1);
        expect(newState.filters[0].active).toBe(false);
        expect(newState.loading).toBe(true);
    });

    test('ENABLE_FILTERS', async () => {
        const filter = {
            type: FilterType.ATTRIBUTE,
            index: 1,
            key: '1',
            value: {value: 'test'},
            active: false,
            condition: AttributeConditionFilter.EQUAL
        };

        const newState = searchReducer(
            {...initialSearchState, filters: [filter]},
            {type: SearchActionTypes.ENABLE_FILTERS}
        );

        expect(newState.filters).toHaveLength(1);
        expect(newState.filters[0].active).toBe(true);
        expect(newState.loading).toBe(true);
    });

    test('APPLY_FILTERS', async () => {
        const filter = {
            type: FilterType.ATTRIBUTE,
            index: 1,
            key: 'id',
            value: {value: 'test'},
            active: true,
            condition: AttributeConditionFilter.EQUAL
        };

        const newState = searchReducer(
            {...initialSearchState, filters: [filter]},
            {type: SearchActionTypes.APPLY_FILTERS}
        );

        expect(newState.filters).toHaveLength(1);
        expect(newState.loading).toBe(true);
    });

    test('SET_VALUES_VERSIONS', async () => {
        const valuesVersions = {
            my_tree: {
                label: 'My node',
                id: '123456'
            }
        };

        const newState = searchReducer(
            {
                ...initialSearchState,
                valuesVersions: {
                    some_tree: {
                        label: 'Some node',
                        id: '987654'
                    }
                }
            },
            {
                type: SearchActionTypes.SET_VALUES_VERSIONS,
                valuesVersions
            }
        );

        expect(Object.keys(newState.valuesVersions)).toHaveLength(2);
        expect(newState.valuesVersions.my_tree.id).toBe('123456');
        expect(newState.valuesVersions.some_tree.id).toBe('987654');
    });

    test('TOGGLE_TRANSPARENCY', () => {
        const newState = searchReducer(initialSearchState, {type: SearchActionTypes.TOGGLE_TRANSPARENCY});
        expect(newState.showTransparency).toBe(true);

        const newState2 = searchReducer(newState, {type: SearchActionTypes.TOGGLE_TRANSPARENCY});
        expect(newState2.showTransparency).toBe(false);
    });

    test('TOGGLE_SIDEBAR', () => {
        const newState = searchReducer(initialSearchState, {type: SearchActionTypes.TOGGLE_SIDEBAR});
        expect(newState.sideBar.visible).toBe(true);

        const newState2 = searchReducer(newState, {type: SearchActionTypes.TOGGLE_SIDEBAR});
        expect(newState2.sideBar.visible).toBe(false);
    });

    test('SET_SIDEBAR', () => {
        const newState = searchReducer(initialSearchState, {
            type: SearchActionTypes.SET_SIDEBAR,
            sidebarType: SidebarContentType.view,
            visible: true
        });

        expect(newState.sideBar.type).toBe(SidebarContentType.view);
        expect(newState.sideBar.visible).toBe(true);
    });

    test('SET_SELECTION', () => {
        const newState = searchReducer(initialSearchState, {
            type: SearchActionTypes.SET_SELECTION,
            selected: [{id: '123456', label: 'My record', library: 'test_lib'}]
        });
        expect(newState.selection.selected).toEqual([{id: '123456', label: 'My record', library: 'test_lib'}]);

        const newStateWithAllSelected = searchReducer(
            {...initialSearchState, selection: {selected: [], allSelected: true}},
            {
                type: SearchActionTypes.SET_SELECTION,
                selected: [{id: '123456', label: 'My record', library: 'test_lib'}]
            }
        );
        expect(newStateWithAllSelected.selection.selected).toEqual([
            {id: '123456', label: 'My record', library: 'test_lib'}
        ]);
        expect(newStateWithAllSelected.selection.allSelected).toBe(false);
    });

    test('TOGGLE_RECORD_SELECTION', async () => {
        const newState = searchReducer(
            {
                ...initialSearchState,
                selection: {
                    selected: [
                        {id: '1', label: 'My record 1', library: 'test_lib'},
                        {id: '2', label: 'My record 2', library: 'test_lib'},
                        {id: '3', label: 'My record 3', library: 'test_lib'}
                    ],
                    allSelected: false
                }
            },
            {
                type: SearchActionTypes.TOGGLE_RECORD_SELECTION,
                record: {id: '2', label: 'My record', library: 'test_lib'}
            }
        );
        expect(newState.selection.selected).toEqual([
            {id: '1', label: 'My record 1', library: 'test_lib'},
            {id: '3', label: 'My record 3', library: 'test_lib'}
        ]);

        const newState2 = searchReducer(newState, {
            type: SearchActionTypes.TOGGLE_RECORD_SELECTION,
            record: {id: '2', label: 'My record 2', library: 'test_lib'}
        });
        expect(newState2.selection.selected).toEqual([
            {id: '1', label: 'My record 1', library: 'test_lib'},
            {id: '3', label: 'My record 3', library: 'test_lib'},
            {id: '2', label: 'My record 2', library: 'test_lib'}
        ]);
    });

    test('SELECT_ALL', () => {
        const newState = searchReducer(initialSearchState, {type: SearchActionTypes.SELECT_ALL});
        expect(newState.selection.allSelected).toBe(true);

        const newStateWithSelection = searchReducer(
            {
                ...initialSearchState,
                selection: {selected: [{id: '123456', label: 'My record', library: 'test_lib'}], allSelected: false}
            },
            {type: SearchActionTypes.SELECT_ALL}
        );
        expect(newStateWithSelection.selection.selected).toEqual([]);
        expect(newStateWithSelection.selection.allSelected).toBe(true);
    });

    test('CLEAR_SELECTION', () => {
        const newState = searchReducer(
            {
                ...initialSearchState,
                selection: {
                    selected: [
                        {id: '1', label: 'My record 1', library: 'test_lib'},
                        {id: '2', label: 'My record 2', library: 'test_lib'},
                        {id: '3', label: 'My record 3', library: 'test_lib'}
                    ],
                    allSelected: false
                }
            },
            {type: SearchActionTypes.CLEAR_SELECTION}
        );
        expect(newState.selection.selected).toEqual([]);
        expect(newState.selection.allSelected).toBe(false);
    });
});
