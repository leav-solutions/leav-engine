import {SortOrder, ViewV2Types, type GetViewV2Query} from '../../../../../../__generated__';
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

    it('serializes each sort in order, using the last attribute of the path as the field', () => {
        const result = viewV2ToSerializedView(
            makeView({
                sorts: [
                    {
                        attributes: [
                            {id: 'author', label: {}},
                            {id: 'name', label: {}},
                        ],
                        order: SortOrder.desc,
                    },
                    {attributes: [{id: 'date', label: {}}], order: SortOrder.asc},
                ],
            }),
        );

        expect(result.sort).toEqual([
            {field: 'name', order: SortOrder.desc},
            {field: 'date', order: SortOrder.asc},
        ]);
    });

    it('skips a sort that has no attribute to sort on', () => {
        const result = viewV2ToSerializedView(
            makeView({
                sorts: [
                    {attributes: [], order: SortOrder.asc},
                    {attributes: [{id: 'date', label: {}}], order: SortOrder.desc},
                ],
            }),
        );

        expect(result.sort).toEqual([{field: 'date', order: SortOrder.desc}]);
    });

    it('returns empty filters (handled in a follow-up ticket)', () => {
        const result = viewV2ToSerializedView(makeView());

        expect(result.filters).toEqual([]);
    });
});
