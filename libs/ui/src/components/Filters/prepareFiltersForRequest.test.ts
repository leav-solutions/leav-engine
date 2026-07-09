import {AttributeFormat, AttributeType, RecordFilterCondition} from '_ui/_gqlTypes';
import {prepareFiltersForRequest} from './prepareFiltersForRequest';
import {type IUIFilterSmartFiler, type IUIFilterStandard, type IUIFilterTree} from './_types';

const smartLinkFilter = (value: IUIFilterSmartFiler['value']): IUIFilterSmartFiler => ({
    id: 'campaign_type',
    field: 'campaign_type',
    condition: RecordFilterCondition.EQUAL,
    value,
    attribute: {
        id: 'campaign_type',
        label: 'Type de campagne',
        type: AttributeType.advanced_link,
        smartFilter: {enable: true},
    },
});

const smartStandardFilter = (value: string[] | string): IUIFilterStandard =>
    ({
        id: 'status',
        field: 'status',
        condition: RecordFilterCondition.EQUAL,
        value,
        attribute: {
            id: 'status',
            label: 'Statut',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            smartFilter: {enable: true},
        },
    }) as unknown as IUIFilterStandard;

describe('prepareFiltersForRequest — smart filter', () => {
    // LEAVC-810: a link smart filter's values are LINKED RECORD IDS, so the query must target `<field>.id`.
    // A bare link field filters on the record's identity/label and returns nothing (the reported bug).
    it('targets `<field>.id` for a LINK smart filter (value = linked record id)', () => {
        const conditions = prepareFiltersForRequest([smartLinkFilter(['9956766'])]);

        expect(conditions).toEqual([
            {field: 'campaign_type.id', condition: RecordFilterCondition.EQUAL, value: '9956766'},
        ]);
    });

    // A smart filter with `through` reaches its values on a sub-attribute of the linked record (e.g.
    // structure_items → structure_items_thematic), so the query must target `<attribute>.<through>.id`.
    // Sending the bare `<attribute>.id` (through lost on the ViewV2 round-trip) returned 0 results.
    it('targets `<attribute>.<through>.id` for a smart filter with a `through`', () => {
        const withThrough: IUIFilterSmartFiler = {
            ...smartLinkFilter(['9956766']),
            attribute: {
                ...smartLinkFilter(['9956766']).attribute,
                smartFilter: {enable: true, through: {id: 'structure_items_thematic'}},
            },
        };

        const conditions = prepareFiltersForRequest([withThrough]);

        expect(conditions).toEqual([
            {
                field: 'campaign_type.structure_items_thematic.id',
                condition: RecordFilterCondition.EQUAL,
                value: '9956766',
            },
        ]);
    });

    it('builds a bracketed OR group (on `<field>.id`) from a multi-value link smart filter', () => {
        const conditions = prepareFiltersForRequest([smartLinkFilter(['t1', 't2'])]);

        expect(conditions).toEqual([
            {operator: 'OPEN_BRACKET'},
            {field: 'campaign_type.id', condition: RecordFilterCondition.EQUAL, value: 't1'},
            {operator: 'OR'},
            {field: 'campaign_type.id', condition: RecordFilterCondition.EQUAL, value: 't2'},
            {operator: 'CLOSE_BRACKET'},
        ]);
    });

    it('does not double-suffix a link smart filter whose field already ends in `.id`', () => {
        const conditions = prepareFiltersForRequest([{...smartLinkFilter(['t1']), field: 'campaign_type.id'}]);

        expect(conditions).toEqual([{field: 'campaign_type.id', condition: RecordFilterCondition.EQUAL, value: 't1'}]);
    });

    it('does NOT add `.id` for a STANDARD smart filter (value is a plain text value)', () => {
        const conditions = prepareFiltersForRequest([smartStandardFilter(['active'])]);

        expect(conditions).toEqual([{field: 'status', condition: RecordFilterCondition.EQUAL, value: 'active'}]);
    });

    // A smart filter on a link/standard attribute can reach here with a SCALAR value (toUIFilters types it
    // as a scalar-valued IUIFilterLink). Without normalization this threw "value.forEach is not a function".
    it('does not throw when a smart filter carries a scalar value (defensive normalization)', () => {
        expect(() => prepareFiltersForRequest([smartLinkFilter('t1' as unknown as string[])])).not.toThrow();

        const conditions = prepareFiltersForRequest([smartLinkFilter('t1' as unknown as string[])]);
        expect(conditions).toEqual([{field: 'campaign_type.id', condition: RecordFilterCondition.EQUAL, value: 't1'}]);
    });
});

describe('prepareFiltersForRequest — tree', () => {
    const treeFilter = (overrides: Partial<IUIFilterTree>): IUIFilterTree =>
        ({
            id: 'category',
            field: 'category',
            condition: RecordFilterCondition.EQUAL,
            value: [],
            nodes: [],
            userNodes: [],
            userFormattedValue: [],
            attribute: {
                id: 'category',
                label: 'Catégorie',
                type: AttributeType.tree,
                linkedTree: {id: 'tree_id'},
            },
            ...overrides,
        }) as unknown as IUIFilterTree;

    it('skips a tree with an explicit empty selection (userNodes: [], no record id)', () => {
        expect(prepareFiltersForRequest([treeFilter({})])).toEqual([]);
    });

    it('keeps a tree that still has a node selection', () => {
        const conditions = prepareFiltersForRequest([
            treeFilter({
                value: ['rec1'],
                nodes: [{nodeId: 'n1', libraryId: 'tree_lib'}],
                userNodes: [{nodeId: 'n1', libraryId: 'tree_lib'}],
            }),
        ]);
        expect(conditions.length).toBeGreaterThan(0);
    });
});
