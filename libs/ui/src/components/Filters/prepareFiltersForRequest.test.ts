import {AttributeFormat, AttributeType, RecordFilterCondition, RecordFilterOperator} from '_ui/_gqlTypes';
import {ThroughConditionFilter} from '_ui/types';
import {dateValuesSeparator, prepareFiltersForRequest} from './prepareFiltersForRequest';
import {type IUIFilterSmartFilter, type IUIFilterStandard, type IUIFilterTree, type UIFilter} from './_types';

/**
 * Characterization tests: they lock the CURRENT behavior of prepareFiltersForRequest
 * (including its quirks) so the upcoming refactor cannot silently change the request output.
 * prepareFiltersForRequest is a public export consumed by AMP/xStream and had zero coverage.
 */

const standardTextFilter = (overrides: Partial<UIFilter> = {}): UIFilter =>
    ({
        id: 'f-text',
        field: 'title',
        value: 'foo',
        condition: RecordFilterCondition.CONTAINS,
        attribute: {id: 'title', label: 'Title', type: AttributeType.simple, format: AttributeFormat.text},
        ...overrides,
    }) as UIFilter;

const standardDateFilter = (overrides: Partial<UIFilter> = {}): UIFilter =>
    ({
        id: 'f-date',
        field: 'created_at',
        value: '1000000000',
        condition: RecordFilterCondition.EQUAL,
        attribute: {id: 'created_at', label: 'Created', type: AttributeType.simple, format: AttributeFormat.date},
        ...overrides,
    }) as UIFilter;

const standardBooleanFilter = (overrides: Partial<UIFilter> = {}): UIFilter =>
    ({
        id: 'f-bool',
        field: 'active',
        value: 'true',
        condition: null,
        attribute: {id: 'active', label: 'Active', type: AttributeType.simple, format: AttributeFormat.boolean},
        ...overrides,
    }) as UIFilter;

const linkFilter = (overrides: Partial<UIFilter> = {}): UIFilter =>
    ({
        id: 'f-link',
        field: 'author.id',
        value: 'rec1',
        condition: RecordFilterCondition.EQUAL,
        attribute: {id: 'author', label: 'Author', type: AttributeType.simple_link, linkedLibrary: {id: 'users'}},
        ...overrides,
    }) as UIFilter;

const throughFilter = (overrides: Partial<UIFilter> = {}): UIFilter =>
    ({
        id: 'f-through',
        field: 'author',
        subField: 'name',
        subCondition: RecordFilterCondition.CONTAINS,
        value: 'bar',
        condition: ThroughConditionFilter.THROUGH,
        attribute: {id: 'author', label: 'Author', type: AttributeType.simple_link, linkedLibrary: {id: 'users'}},
        ...overrides,
    }) as UIFilter;

const smartFilter = (overrides: Partial<UIFilter> = {}): UIFilter =>
    ({
        id: 'f-smart',
        field: 'category',
        value: ['v1', 'v2'],
        condition: RecordFilterCondition.EQUAL,
        attribute: {
            id: 'category',
            label: 'Category',
            type: AttributeType.simple_link,
            linkedLibrary: {id: 'cats'},
            smartFilter: {enable: true},
        },
        ...overrides,
    }) as UIFilter;

const standardValueListFilter = (overrides: Partial<UIFilter> = {}): UIFilter =>
    ({
        id: 'f-vl',
        field: 'status',
        value: ['a', 'b'],
        condition: RecordFilterCondition.EQUAL,
        attribute: {
            id: 'status',
            label: 'Status',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            valuesList: {enable: true, values: ['a', 'b', 'c']},
        },
        ...overrides,
    }) as UIFilter;

const linkValueListFilter = (overrides: Partial<UIFilter> = {}): UIFilter =>
    ({
        id: 'f-lvl',
        field: 'tag',
        value: ['t1'],
        condition: RecordFilterCondition.EQUAL,
        attribute: {
            id: 'tag',
            label: 'Tag',
            type: AttributeType.simple_link,
            linkedLibrary: {id: 'tags'},
            valuesList: {enable: true, linkedValues: []},
        },
        ...overrides,
    }) as UIFilter;

const treeFilter = (overrides: Partial<UIFilter> = {}): UIFilter =>
    ({
        id: 'f-tree',
        field: ['categories'],
        value: ['node1'],
        userNodes: [{nodeId: 'node1', libraryId: 'libA'}],
        condition: RecordFilterCondition.EQUAL,
        attribute: {id: 'categories', label: 'Categories', type: AttributeType.tree, linkedTree: {id: 'tree1'}},
        ...overrides,
    }) as UIFilter;

describe('prepareFiltersForRequest (characterization)', () => {
    describe('standard filters', () => {
        test('text CONTAINS', () => {
            expect(prepareFiltersForRequest([standardTextFilter()])).toEqual([
                {field: 'title', condition: RecordFilterCondition.CONTAINS, value: 'foo'},
            ]);
        });

        test('date EQUAL is shifted to noon', () => {
            expect(prepareFiltersForRequest([standardDateFilter()])).toEqual([
                {field: 'created_at', condition: RecordFilterCondition.EQUAL, value: '1000043200'},
            ]);
        });

        test('date NOT_EQUAL is shifted to noon', () => {
            expect(
                prepareFiltersForRequest([standardDateFilter({condition: RecordFilterCondition.NOT_EQUAL})]),
            ).toEqual([{field: 'created_at', condition: RecordFilterCondition.NOT_EQUAL, value: '1000043200'}]);
        });

        test('date BETWEEN serializes from/to as JSON', () => {
            const filter = standardDateFilter({
                condition: RecordFilterCondition.BETWEEN,
                value: `100${dateValuesSeparator}200`,
            });
            expect(prepareFiltersForRequest([filter])).toEqual([
                {
                    field: 'created_at',
                    condition: RecordFilterCondition.BETWEEN,
                    value: JSON.stringify({from: '100', to: '200'}),
                },
            ]);
        });

        test('boolean true keeps value', () => {
            expect(prepareFiltersForRequest([standardBooleanFilter()])).toEqual([
                {field: 'active', condition: null, value: 'true'},
            ]);
        });

        test('boolean false becomes NOT_EQUAL true', () => {
            expect(prepareFiltersForRequest([standardBooleanFilter({value: 'false'})])).toEqual([
                {field: 'active', condition: RecordFilterCondition.NOT_EQUAL, value: 'true'},
            ]);
        });
    });

    describe('link & through filters', () => {
        test('link EQUAL', () => {
            expect(prepareFiltersForRequest([linkFilter()])).toEqual([
                {field: 'author.id', condition: RecordFilterCondition.EQUAL, value: 'rec1'},
            ]);
        });

        test('through filter builds field.subField and uses subCondition', () => {
            expect(prepareFiltersForRequest([throughFilter()])).toEqual([
                {field: 'author.name', condition: RecordFilterCondition.CONTAINS, value: 'bar'},
            ]);
        });
    });

    describe('value list filters', () => {
        test('standard value list (single value)', () => {
            expect(prepareFiltersForRequest([standardValueListFilter({value: ['a']})])).toEqual([
                {field: 'status', condition: RecordFilterCondition.EQUAL, value: 'a'},
            ]);
        });

        test('standard value list (multiple values) wrapped in brackets with OR', () => {
            expect(prepareFiltersForRequest([standardValueListFilter()])).toEqual([
                {operator: RecordFilterOperator.OPEN_BRACKET},
                {field: 'status', condition: RecordFilterCondition.EQUAL, value: 'a'},
                {operator: RecordFilterOperator.OR},
                {field: 'status', condition: RecordFilterCondition.EQUAL, value: 'b'},
                {operator: RecordFilterOperator.CLOSE_BRACKET},
            ]);
        });

        test('link value list filters on linked record id', () => {
            expect(prepareFiltersForRequest([linkValueListFilter()])).toEqual([
                {field: 'tag.id', condition: RecordFilterCondition.EQUAL, value: 't1'},
            ]);
        });
    });

    describe('smart filters', () => {
        // LEAVC-810: a link smart filter's values are LINKED RECORD IDS → the query targets `<field>.id`.
        test('multiple values use OR', () => {
            expect(prepareFiltersForRequest([smartFilter()])).toEqual([
                {operator: RecordFilterOperator.OPEN_BRACKET},
                {field: 'category.id', condition: RecordFilterCondition.EQUAL, value: 'v1'},
                {operator: RecordFilterOperator.OR},
                {field: 'category.id', condition: RecordFilterCondition.EQUAL, value: 'v2'},
                {operator: RecordFilterOperator.CLOSE_BRACKET},
            ]);
        });

        test('multiple values with NOT_EQUAL use AND', () => {
            expect(prepareFiltersForRequest([smartFilter({condition: RecordFilterCondition.NOT_EQUAL})])).toEqual([
                {operator: RecordFilterOperator.OPEN_BRACKET},
                {field: 'category.id', condition: RecordFilterCondition.NOT_EQUAL, value: 'v1'},
                {operator: RecordFilterOperator.AND},
                {field: 'category.id', condition: RecordFilterCondition.NOT_EQUAL, value: 'v2'},
                {operator: RecordFilterOperator.CLOSE_BRACKET},
            ]);
        });
    });

    describe('tree filters', () => {
        test('tree with user selection', () => {
            expect(prepareFiltersForRequest([treeFilter()])).toEqual([
                {field: 'categories', condition: RecordFilterCondition.EQUAL, value: 'node1'},
            ]);
        });

        test('tree with nodes targets attribute.library.id field', () => {
            const filter = treeFilter({
                value: ['node1'],
                nodes: [{nodeId: 'node1', libraryId: 'libA'}],
            });
            expect(prepareFiltersForRequest([filter])).toEqual([
                {field: 'categories.libA.id', condition: RecordFilterCondition.EQUAL, value: 'node1'},
            ]);
        });

        test('tree with no user selection and no initial value is skipped', () => {
            const filter = treeFilter({value: null, userNodes: null});
            expect(prepareFiltersForRequest([filter])).toEqual([]);
        });

        test('tree with no user selection but withEmptyValues yields IS_EMPTY', () => {
            const filter = treeFilter({value: null, userNodes: null, withEmptyValues: true});
            expect(prepareFiltersForRequest([filter])).toEqual([
                {field: 'categories', condition: RecordFilterCondition.IS_EMPTY, value: null},
            ]);
        });
    });

    describe('withEmptyValues wrapping', () => {
        test('standard value list with withEmptyValues adds OR IS_EMPTY branch', () => {
            const filter = standardValueListFilter({value: ['a'], withEmptyValues: true});
            expect(prepareFiltersForRequest([filter])).toEqual([
                {operator: RecordFilterOperator.OPEN_BRACKET},
                {field: 'status', condition: RecordFilterCondition.EQUAL, value: 'a'},
                {operator: RecordFilterOperator.OR},
                {field: 'status', condition: RecordFilterCondition.IS_EMPTY, value: null},
                {operator: RecordFilterOperator.CLOSE_BRACKET},
            ]);
        });
    });

    describe('filters skipped when empty', () => {
        test('smart filter with no value is skipped', () => {
            expect(prepareFiltersForRequest([smartFilter({value: null})])).toEqual([]);
        });

        test('through filter without subField/subCondition is skipped', () => {
            expect(prepareFiltersForRequest([throughFilter({subField: null, subCondition: null})])).toEqual([]);
        });

        test('value list with no value is skipped', () => {
            expect(prepareFiltersForRequest([standardValueListFilter({value: null})])).toEqual([]);
        });
    });

    describe('null-value conditions', () => {
        test('IS_EMPTY standard filter (no value)', () => {
            expect(
                prepareFiltersForRequest([
                    standardTextFilter({condition: RecordFilterCondition.IS_EMPTY, value: null}),
                ]),
            ).toEqual([{field: 'title', condition: RecordFilterCondition.IS_EMPTY, value: null}]);
        });
    });

    describe('empty inputs', () => {
        test('empty array returns empty array', () => {
            expect(prepareFiltersForRequest([])).toEqual([]);
        });
    });

    describe('operator between filters', () => {
        test('AND operator interleaves multiple filters', () => {
            expect(prepareFiltersForRequest([standardTextFilter(), linkFilter()], 'AND')).toEqual([
                {field: 'title', condition: RecordFilterCondition.CONTAINS, value: 'foo'},
                {operator: RecordFilterOperator.AND},
                {field: 'author.id', condition: RecordFilterCondition.EQUAL, value: 'rec1'},
            ]);
        });

        test('OR operator interleaves multiple filters', () => {
            expect(prepareFiltersForRequest([standardTextFilter(), linkFilter()], 'OR')).toEqual([
                {field: 'title', condition: RecordFilterCondition.CONTAINS, value: 'foo'},
                {operator: RecordFilterOperator.OR},
                {field: 'author.id', condition: RecordFilterCondition.EQUAL, value: 'rec1'},
            ]);
        });
    });

    describe('valuesList tail argument', () => {
        test('appends AND + bracketed id list after the filters', () => {
            expect(prepareFiltersForRequest([standardTextFilter()], 'AND', ['id1', 'id2'])).toEqual([
                {field: 'title', condition: RecordFilterCondition.CONTAINS, value: 'foo'},
                {operator: RecordFilterOperator.AND},
                {operator: RecordFilterOperator.OPEN_BRACKET},
                {field: 'id', condition: RecordFilterCondition.EQUAL, value: 'id1'},
                {operator: RecordFilterOperator.OR},
                {field: 'id', condition: RecordFilterCondition.EQUAL, value: 'id2'},
                {operator: RecordFilterOperator.CLOSE_BRACKET},
            ]);
        });

        test('valuesList alone (no filters) has no leading AND', () => {
            expect(prepareFiltersForRequest([], 'AND', ['id1'])).toEqual([
                {operator: RecordFilterOperator.OPEN_BRACKET},
                {field: 'id', condition: RecordFilterCondition.EQUAL, value: 'id1'},
                {operator: RecordFilterOperator.CLOSE_BRACKET},
            ]);
        });
    });
});

const smartLinkFilter = (value: IUIFilterSmartFilter['value']): IUIFilterSmartFilter => ({
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
        const withThrough: IUIFilterSmartFilter = {
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
    const treeFilterWithNodes = (overrides: Partial<IUIFilterTree>): IUIFilterTree =>
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
        expect(prepareFiltersForRequest([treeFilterWithNodes({})])).toEqual([]);
    });

    it('keeps a tree that still has a node selection', () => {
        const conditions = prepareFiltersForRequest([
            treeFilterWithNodes({
                value: ['rec1'],
                nodes: [{nodeId: 'n1', libraryId: 'tree_lib'}],
                userNodes: [{nodeId: 'n1', libraryId: 'tree_lib'}],
            }),
        ]);
        expect(conditions.length).toBeGreaterThan(0);
    });
});
