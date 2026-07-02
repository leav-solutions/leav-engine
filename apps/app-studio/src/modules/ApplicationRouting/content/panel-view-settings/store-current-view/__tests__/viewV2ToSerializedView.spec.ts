import {SortOrder, ViewV2Shortcut, ViewV2Types, type GetViewV2Query} from '../../../../../../__generated__';
import {IDENTITY_COLUMN_ID} from '../../tabs/tab-display/_constants';
import {viewV2ToSerializedView} from '../viewV2ToSerializedView';

type ViewV2 = GetViewV2Query['viewV2'];

const makeView = (overrides: Partial<ViewV2> = {}): ViewV2 => ({
    id: 'view-1',
    library: 'my_lib',
    label: {fr: 'Ma vue'},
    shared: false,
    created_by: {id: '123', whoAmI: {id: '123', label: 'Moi'}},
    display: {type: ViewV2Types.list, attributes: []},
    sorts: [],
    filters: [],
    shortcuts: [ViewV2Shortcut.display],
    ...overrides,
});

describe('viewV2ToSerializedView', () => {
    it('maps the id, labels and display type', () => {
        const result = viewV2ToSerializedView(makeView({id: 'view-42', label: {fr: 'Vue'}}));

        expect(result.viewId).toBe('view-42');
        expect(result.viewLabels).toEqual({fr: 'Vue'});
        expect(result.viewType).toBe(ViewV2Types.list);
    });

    it('keeps only visible display attributes and excludes the identity column', () => {
        const result = viewV2ToSerializedView(
            makeView({
                display: {
                    type: ViewV2Types.list,
                    attributes: [
                        {visible: true, attribute: {id: 'attribute_2', label: {fr: 'Attribut 2'}}},
                        {visible: false, attribute: {id: 'attribute_3', label: {fr: 'Attribut 3'}}},
                        {visible: true, attribute: {id: IDENTITY_COLUMN_ID, label: {fr: 'Identité'}}},
                    ],
                },
            }),
        );

        expect(result.attributesIds).toEqual(['attribute_2']);
    });

    it('serializes each pinned sort in order, joining the descent path into a dotted field', () => {
        const result = viewV2ToSerializedView(
            makeView({
                sorts: [
                    {
                        attributes: [
                            {id: 'author', label: {}},
                            {id: 'name', label: {}},
                        ],
                        order: SortOrder.desc,
                        pinned: true,
                    },
                    {attributes: [{id: 'date', label: {}}], order: SortOrder.asc, pinned: true},
                ],
            }),
        );

        expect(result.sort).toEqual([
            {field: 'author.name', order: SortOrder.desc},
            {field: 'date', order: SortOrder.asc},
        ]);
    });

    it('keeps only pinned sorts (unpinned sorts are configured but not applied)', () => {
        const result = viewV2ToSerializedView(
            makeView({
                sorts: [
                    {attributes: [{id: 'author', label: {}}], order: SortOrder.asc, pinned: false},
                    {attributes: [{id: 'date', label: {}}], order: SortOrder.desc, pinned: true},
                ],
            }),
        );

        expect(result.sort).toEqual([{field: 'date', order: SortOrder.desc}]);
    });

    it('skips a sort that has no attribute to sort on', () => {
        const result = viewV2ToSerializedView(
            makeView({
                sorts: [
                    {attributes: [], order: SortOrder.asc, pinned: true},
                    {attributes: [{id: 'date', label: {}}], order: SortOrder.desc, pinned: true},
                ],
            }),
        );

        expect(result.sort).toEqual([{field: 'date', order: SortOrder.desc}]);
    });

    it('serializes pinned user filters in the lean form (attributes path + condition + values + pinned)', () => {
        const result = viewV2ToSerializedView(
            makeView({
                filters: [
                    {
                        attributes: [
                            {id: 'campaigns', label: {fr: 'Campagnes'}},
                            {id: 'label', label: {fr: 'Libellé'}},
                        ],
                        condition: 'CONTAINS',
                        values: ['Noël'],
                        pinned: true,
                    },
                ] as never,
            }),
        );

        expect(result.filters).toEqual([
            {
                attributes: [
                    {id: 'campaigns', label: {fr: 'Campagnes'}},
                    {id: 'label', label: {fr: 'Libellé'}},
                ],
                condition: 'CONTAINS',
                values: ['Noël'],
                pinned: true,
                withEmptyValues: false,
            },
        ]);
    });

    it('excludes unpinned filters (configured but not applied, like unpinned sorts)', () => {
        const result = viewV2ToSerializedView(
            makeView({
                filters: [
                    {attributes: [{id: 'status', label: {}}], condition: 'EQUAL', values: ['a'], pinned: false},
                    {attributes: [{id: 'kind', label: {}}], condition: 'EQUAL', values: ['b'], pinned: true},
                ] as never,
            }),
        );

        expect(result.filters).toEqual([
            {
                attributes: [{id: 'kind', label: {}}],
                condition: 'EQUAL',
                values: ['b'],
                pinned: true,
                withEmptyValues: false,
            },
        ]);
    });

    it('emits a JSON-serializable shape (no GraphQL fragment fields)', () => {
        const result = viewV2ToSerializedView(
            makeView({
                filters: [
                    {attributes: [{id: 'status', label: {}}], condition: 'EQUAL', values: ['a'], pinned: true},
                ] as never,
            }),
        );

        // Round-trips through JSON unchanged → safe to transport across an iframe (LEAVC-810).
        expect(JSON.parse(JSON.stringify(result.filters))).toEqual(result.filters);
    });

    it('maps the view shortcuts', () => {
        const result = viewV2ToSerializedView(
            makeView({shortcuts: [ViewV2Shortcut.display, ViewV2Shortcut.sorts, ViewV2Shortcut.catalog]}),
        );

        expect(result.shortcuts).toEqual([ViewV2Shortcut.display, ViewV2Shortcut.sorts, ViewV2Shortcut.catalog]);
    });
});
