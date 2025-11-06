// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type IViewSettingsState,
    ViewSettingsActionTypes,
    viewSettingsReducer,
    type ViewType,
} from './viewSettingsReducer';
import {defaultPageSizeOptions, viewSettingsInitialState} from './viewSettingsInitialState';
import {AttributeFormat, AttributeType, RecordFilterCondition, SortOrder, ViewTypes} from '_ui/_gqlTypes';
import {ThroughConditionFilter} from '_ui/types';
import {mapViewTypeFromLegacyToExplorer} from '../../_constants';

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

describe('ViewSettings Reducer', () => {
    describe(`Action ${ViewSettingsActionTypes.CHANGE_PAGE_SIZE}`, () => {
        test('default value should be the first of defaultPageSizeOptions', () => {
            expect(viewSettingsInitialState.pageSize).toEqual(defaultPageSizeOptions[0]);
        });

        test('if the action can modify the pageSize', () => {
            const state = viewSettingsReducer(viewSettingsInitialState, {
                type: ViewSettingsActionTypes.CHANGE_PAGE_SIZE,
                payload: {
                    pageSize: 42,
                },
            });
            expect(state.pageSize).toEqual(42);
        });
    });

    test(`Action ${ViewSettingsActionTypes.ADD_ATTRIBUTE} test`, () => {
        const state = viewSettingsReducer(viewSettingsInitialState, {
            type: ViewSettingsActionTypes.ADD_ATTRIBUTE,
            payload: {attributeId: 'test'},
        });
        expect(state.attributesIds).toEqual(['test']);
        expect(state.viewModified).toEqual(true);
    });

    test(`Action ${ViewSettingsActionTypes.REMOVE_ATTRIBUTE} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                attributesIds: ['test', 'active', 'created_at'],
            },
            {
                type: ViewSettingsActionTypes.REMOVE_ATTRIBUTE,
                payload: {attributeId: 'test'},
            },
        );
        expect(state.attributesIds).toEqual(['active', 'created_at']);
        expect(state.viewModified).toEqual(true);
    });

    describe(`Action ${ViewSettingsActionTypes.MOVE_ATTRIBUTE} test`, () => {
        const initialState: IViewSettingsState = {
            ...viewSettingsInitialState,
            attributesIds: ['test', 'active', 'created_at'],
        };

        const cases = [
            {
                indexFrom: 0,
                indexTo: 2,
                expected: ['active', 'created_at', 'test'],
            },
            {
                indexFrom: 2,
                indexTo: 0,
                expected: ['created_at', 'test', 'active'],
            },
            {
                indexFrom: 2,
                indexTo: 1,
                expected: ['test', 'created_at', 'active'],
            },
            {
                indexFrom: 0,
                indexTo: 0,
                expected: initialState.attributesIds,
            },
        ];

        test.each(cases)('Move attribute from $indexFrom to $indexTo', ({indexFrom, indexTo, expected}) => {
            const state = viewSettingsReducer(initialState, {
                type: ViewSettingsActionTypes.MOVE_ATTRIBUTE,
                payload: {indexFrom, indexTo},
            });
            expect(state.attributesIds).toEqual(expected);
            expect(state.viewModified).toEqual(true);
        });
    });

    test(`Action ${ViewSettingsActionTypes.RESET_ATTRIBUTES} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                attributesIds: ['test', 'active', 'created_at'],
            },
            {
                type: ViewSettingsActionTypes.RESET_ATTRIBUTES,
            },
        );
        expect(state.attributesIds).toEqual([]);
        expect(state.viewModified).toEqual(false);
    });

    test.each(['table', 'list', 'mosaic', 'timeline'])(
        `Action ${ViewSettingsActionTypes.CHANGE_VIEW_TYPE} to %s`,
        viewType => {
            const state = viewSettingsReducer(viewSettingsInitialState, {
                type: ViewSettingsActionTypes.CHANGE_VIEW_TYPE,
                payload: {viewType: viewType as ViewType},
            });
            expect(state.viewType).toEqual(viewType);
            expect(state.viewModified).toEqual(true);
        },
    );

    test(`Action ${ViewSettingsActionTypes.ADD_SORT} test`, () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                sort: [
                    {
                        field: 'first',
                        order: SortOrder.asc,
                    },
                ],
            },
            {
                type: ViewSettingsActionTypes.ADD_SORT,
                payload: {
                    field: 'attributeId',
                    order: SortOrder.desc,
                },
            },
        );
        expect(state.sort).toHaveLength(2);
        expect(state.sort).toEqual([
            {
                field: 'first',
                order: SortOrder.asc,
            },
            {
                field: 'attributeId',
                order: 'desc',
            },
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
                        order: SortOrder.asc,
                    },
                    {
                        field: 'second',
                        order: SortOrder.desc,
                    },
                    {
                        field: 'third',
                        order: SortOrder.desc,
                    },
                ],
            },
            {
                type: ViewSettingsActionTypes.REMOVE_SORT,
                payload: {
                    field: 'second',
                },
            },
        );
        expect(state.sort).toHaveLength(2);
        expect(state.sort).toEqual([
            {
                field: 'first',
                order: 'asc',
            },
            {
                field: 'third',
                order: 'desc',
            },
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
                        order: SortOrder.asc,
                    },
                    {
                        field: 'second',
                        order: SortOrder.asc,
                    },
                ],
            },
            {
                type: ViewSettingsActionTypes.CHANGE_SORT_ORDER,
                payload: {
                    field: 'first',
                    order: SortOrder.desc,
                },
            },
        );
        expect(state.sort).toHaveLength(2);
        expect(state.sort).toEqual([
            {
                field: 'first',
                order: SortOrder.desc,
            },
            {
                field: 'second',
                order: SortOrder.asc,
            },
        ]);
        expect(state.viewModified).toEqual(true);
    });

    describe(`Action ${ViewSettingsActionTypes.MOVE_SORT} test`, () => {
        const initialState: IViewSettingsState = {
            ...viewSettingsInitialState,
            sort: [
                {order: SortOrder.desc, field: 'test'},
                {order: SortOrder.asc, field: 'active'},
                {order: SortOrder.asc, field: 'created_at'},
            ],
        };

        const cases = [
            {
                indexFrom: 0,
                indexTo: 2,
                expected: [
                    {order: SortOrder.asc, field: 'active'},
                    {order: SortOrder.asc, field: 'created_at'},
                    {order: SortOrder.desc, field: 'test'},
                ],
            },
            {
                indexFrom: 2,
                indexTo: 0,
                expected: [
                    {order: SortOrder.asc, field: 'created_at'},
                    {order: SortOrder.desc, field: 'test'},
                    {order: SortOrder.asc, field: 'active'},
                ],
            },
            {
                indexFrom: 2,
                indexTo: 1,
                expected: [
                    {order: SortOrder.desc, field: 'test'},
                    {order: SortOrder.asc, field: 'created_at'},
                    {order: SortOrder.asc, field: 'active'},
                ],
            },
            {
                indexFrom: 0,
                indexTo: 0,
                expected: initialState.sort,
            },
        ];

        test.each(cases)('Move sort from $indexFrom to $indexTo', ({indexFrom, indexTo, expected}) => {
            const state = viewSettingsReducer(initialState, {
                type: ViewSettingsActionTypes.MOVE_SORT,
                payload: {indexFrom, indexTo},
            });
            expect(state.sort).toEqual(expected);
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
                    value: null,
                },
            ],
            sort: [
                {
                    field: 'first',
                    order: SortOrder.asc,
                },
            ],
            fulltextSearch: 'test',
            attributesIds: ['first'],
            viewType: 'table' as ViewType,
        };

        const state = viewSettingsReducer(viewSettingsInitialState, {
            type: ViewSettingsActionTypes.RESET,
            payload: newState,
        });

        expect(state).toEqual(newState);
        expect(state.viewModified).toEqual(false);
    });

    test(`Action ${ViewSettingsActionTypes.RESTORE_INITIAL_VIEW_SETTINGS} test`, async () => {
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                viewType: 'mosaic',
                sort: [
                    {
                        field: 'first',
                        order: SortOrder.asc,
                    },
                ],
                attributesIds: ['firstAttribute', 'secondAttribute', 'thirdAttribute'],
                initialViewSettings: {
                    viewType: viewSettingsInitialState.viewType,
                    sort: viewSettingsInitialState.sort,
                    attributesIds: viewSettingsInitialState.attributesIds,
                    pageSize: viewSettingsInitialState.pageSize,
                },
                viewModified: true,
            },
            {
                type: ViewSettingsActionTypes.RESTORE_INITIAL_VIEW_SETTINGS,
            },
        );

        expect(state).toEqual(viewSettingsInitialState);
        expect(state.viewModified).toEqual(false);
    });

    test(`Action ${ViewSettingsActionTypes.SET_SELECTED_KEYS} test`, async () => {
        const newSelectedKeys = ['key1', 'key2', 'key3'];
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                massSelection: ['toBeDeletedKey'],
            },
            {
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: newSelectedKeys,
            },
        );

        expect(state.massSelection).toEqual(newSelectedKeys);
        expect(state.viewModified).toEqual(false);
    });

    test(`Action ${ViewSettingsActionTypes.UPDATE_VIEWS} test`, async () => {
        const view = {
            id: 'viewId',
            ownerId: 'Admin',
            label: {
                fr: 'Ma vue',
            },
            shared: false,
            filters: [],
            display: {type: ViewTypes.list},
        };
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                viewModified: true,
            },
            {
                type: ViewSettingsActionTypes.UPDATE_VIEWS,
                payload: view,
            },
        );

        expect(state.viewId).toEqual(view.id);
        expect(state.viewLabels).toEqual(view.label);
        expect(state.savedViews.length).toEqual(1);
        expect(state.viewModified).toEqual(false);
    });

    test(`Action ${ViewSettingsActionTypes.RENAME_VIEW} test`, async () => {
        const view = {
            id: 'viewId',
            label: {
                fr: 'Ma nouvelle vue',
            },
        };
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                savedViews: [
                    {
                        id: 'viewId',
                        ownerId: 'Admin',
                        label: {
                            fr: 'Ma vue',
                        },
                        shared: false,
                        filters: [],
                        display: {type: ViewTypes.list},
                    },
                ],
                viewModified: true,
            },
            {
                type: ViewSettingsActionTypes.RENAME_VIEW,
                payload: view,
            },
        );

        expect(state.viewLabels).toEqual(view.label);
        expect(state.savedViews[0].label).toEqual(view.label);
        expect(state.viewModified).toEqual(true);
    });

    test(`Action ${ViewSettingsActionTypes.DELETE_VIEW} test when delete current view`, async () => {
        const id = 'viewId';
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                viewId: id,
                savedViews: [
                    {
                        id,
                        ownerId: 'Admin',
                        label: {
                            fr: 'Ma vue',
                        },
                        shared: false,
                        filters: [],
                        display: {type: ViewTypes.list},
                    },
                ],
                viewModified: true,
            },
            {
                type: ViewSettingsActionTypes.DELETE_VIEW,
                payload: {id},
            },
        );

        expect(state.viewId).toEqual(null);
        expect(state.savedViews.length).toEqual(0);
        expect(state.viewModified).toEqual(false);
    });

    test(`Action ${ViewSettingsActionTypes.DELETE_VIEW} test when delete another view`, async () => {
        const id = 'viewId';
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                savedViews: [
                    {
                        id,
                        ownerId: 'Admin',
                        label: {
                            fr: 'Ma vue',
                        },
                        shared: false,
                        filters: [],
                        display: {type: ViewTypes.list},
                    },
                ],
                viewModified: true,
            },
            {
                type: ViewSettingsActionTypes.DELETE_VIEW,
                payload: {id},
            },
        );

        expect(state.savedViews.length).toEqual(0);
        expect(state.viewModified).toEqual(true);
    });

    test(`Action ${ViewSettingsActionTypes.LOAD_VIEW} test`, async () => {
        const view = {
            viewId: 'viewId',
            viewLabels: {
                fr: 'Ma vue',
            },
            shared: false,
            filters: [],
            sort: [],
            display: {type: ViewTypes.list},
            viewType: mapViewTypeFromLegacyToExplorer.list,
            attributesIds: [],
            initialViewSettings: {
                sort: [],
                attributesIds: [],
                filters: [],
                viewType: mapViewTypeFromLegacyToExplorer.list,
                pageSize: defaultPageSizeOptions[0],
            },
        };
        const state = viewSettingsReducer(
            {
                ...viewSettingsInitialState,
                viewModified: true,
            },
            {
                type: ViewSettingsActionTypes.LOAD_VIEW,
                payload: view,
            },
        );

        expect(state.viewId).toEqual(view.viewId);
        expect(state.viewLabels).toEqual(view.viewLabels);
        expect(state.viewModified).toEqual(false);
    });
});
