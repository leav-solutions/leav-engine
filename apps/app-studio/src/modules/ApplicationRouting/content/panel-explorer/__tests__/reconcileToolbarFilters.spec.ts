import {type SerializedFilter} from '@leav/ui';
import {RecordFilterCondition} from '../../../../../__generated__';
import {reconcileToolbarFilters} from '../reconcileToolbarFilters';

const makeIncoming = (path: string[], overrides: Partial<SerializedFilter> = {}): SerializedFilter => ({
    attributes: path.map(id => ({id})),
    condition: RecordFilterCondition.EQUAL,
    values: [],
    ...overrides,
});

describe('reconcileToolbarFilters', () => {
    it('edits an existing filter value (setConfig) when the path is unchanged', () => {
        const incoming = [makeIncoming(['status'], {values: ['open']})];
        const hub = [{id: 'status', pinned: true}];

        const ops = reconcileToolbarFilters(incoming, hub);

        expect(ops).toEqual([
            {
                type: 'setConfig',
                id: 'status',
                condition: RecordFilterCondition.EQUAL,
                values: ['open'],
                withEmptyValues: undefined,
            },
        ]);
    });

    it('re-paths a bare link that became a through (link → link/subAttr) without unpinning', () => {
        const incoming = [
            makeIncoming(['link', 'subAttr'], {values: ['x'], condition: RecordFilterCondition.CONTAINS}),
        ];
        const hub = [{id: 'link', pinned: true}];

        const ops = reconcileToolbarFilters(incoming, hub);

        expect(ops).toEqual([
            {
                type: 'rePath',
                oldId: 'link',
                attributes: [{id: 'link'}, {id: 'subAttr'}],
                condition: RecordFilterCondition.CONTAINS,
                values: ['x'],
                withEmptyValues: undefined,
            },
        ]);
        expect(ops.some(op => op.type === 'unpin')).toBe(false);
    });

    it('re-paths when the sub-attribute changes (link/subA → link/subB)', () => {
        const incoming = [makeIncoming(['link', 'subB'])];
        const hub = [{id: 'link/subA', pinned: true}];

        const ops = reconcileToolbarFilters(incoming, hub);

        expect(ops).toEqual([
            {
                type: 'rePath',
                oldId: 'link/subA',
                attributes: [{id: 'link'}, {id: 'subB'}],
                condition: RecordFilterCondition.EQUAL,
                values: [],
                withEmptyValues: undefined,
            },
        ]);
    });

    it('re-paths when clearing the sub-attribute (through → bare link, link/subAttr → link)', () => {
        const incoming = [makeIncoming(['link'])];
        const hub = [{id: 'link/subAttr', pinned: true}];

        const ops = reconcileToolbarFilters(incoming, hub);

        expect(ops).toEqual([
            {
                type: 'rePath',
                oldId: 'link/subAttr',
                attributes: [{id: 'link'}],
                condition: RecordFilterCondition.EQUAL,
                values: [],
                withEmptyValues: undefined,
            },
        ]);
    });

    it('unpins a pinned filter that genuinely vanished from the toolbar (real removal)', () => {
        const incoming = [makeIncoming(['status'])];
        const hub = [
            {id: 'status', pinned: true},
            {id: 'other', pinned: true},
        ];

        const ops = reconcileToolbarFilters(incoming, hub);

        expect(ops).toContainEqual({type: 'unpin', id: 'other'});
        expect(ops.some(op => op.type === 'rePath')).toBe(false);
    });

    it('does not unpin the re-path source (its base is shared by an incoming filter)', () => {
        const incoming = [makeIncoming(['link', 'subAttr'])];
        const hub = [{id: 'link', pinned: true}];

        const ops = reconcileToolbarFilters(incoming, hub);

        expect(ops.some(op => op.type === 'unpin')).toBe(false);
        expect(ops).toContainEqual(expect.objectContaining({type: 'rePath', oldId: 'link'}));
    });

    it('never unpins an unpinned hub filter, even when it vanishes', () => {
        const incoming: SerializedFilter[] = [];
        const hub = [{id: 'status', pinned: false}];

        const ops = reconcileToolbarFilters(incoming, hub);

        expect(ops).toEqual([]);
    });

    it('carries withEmptyValues through both setConfig and rePath', () => {
        const incoming = [
            makeIncoming(['status'], {withEmptyValues: true}),
            makeIncoming(['link', 'subAttr'], {withEmptyValues: true}),
        ];
        const hub = [
            {id: 'status', pinned: true},
            {id: 'link', pinned: true},
        ];

        const ops = reconcileToolbarFilters(incoming, hub);

        expect(ops).toContainEqual(expect.objectContaining({type: 'setConfig', id: 'status', withEmptyValues: true}));
        expect(ops).toContainEqual(expect.objectContaining({type: 'rePath', oldId: 'link', withEmptyValues: true}));
    });

    it('resolves a null incoming condition to EQUAL', () => {
        const incoming = [makeIncoming(['status'], {condition: null})];
        const hub = [{id: 'status', pinned: true}];

        const ops = reconcileToolbarFilters(incoming, hub);

        expect(ops[0]).toMatchObject({type: 'setConfig', condition: RecordFilterCondition.EQUAL});
    });
});
