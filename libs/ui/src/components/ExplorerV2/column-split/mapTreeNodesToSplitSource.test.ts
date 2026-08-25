import {COLUMN_SPLIT_UNAVAILABLE} from './_constants';
import {mapTreeNodesToSplitSource, type ITreeSplitNode} from './mapTreeNodesToSplitSource';

const _node = (id: string, overrides: Partial<ITreeSplitNode> = {}): ITreeSplitNode => ({
    id: `node-${id}`,
    childrenCount: 0,
    record: {whoAmI: {label: id, color: null}},
    ...overrides,
});

describe('mapTreeNodesToSplitSource', () => {
    it('maps a flat tree to one option per root node, keyed on the NODE id', () => {
        const source = mapTreeNodesToSplitSource([
            _node('draft', {record: {whoAmI: {label: 'Brouillon', color: '#f8e58c'}}}),
            _node('published', {record: {whoAmI: {label: 'Publié', color: null}}}),
        ]);

        expect(source).toEqual({
            options: [
                {key: 'node-draft', label: 'Brouillon', color: '#f8e58c', rawValue: 'node-draft'},
                {key: 'node-published', label: 'Publié', color: null, rawValue: 'node-published'},
            ],
        });
    });

    it('falls back to the node id when its record has no label', () => {
        const source = mapTreeNodesToSplitSource([_node('draft', {record: {whoAmI: {label: null, color: null}}})]);

        expect(source.options).toEqual([{key: 'node-draft', label: 'node-draft', color: null, rawValue: 'node-draft'}]);
    });

    it('treats a missing childrenCount as a leaf', () => {
        expect(mapTreeNodesToSplitSource([_node('draft', {childrenCount: null})]).options).toHaveLength(1);
    });

    it('declares the whole attribute unsplittable as soon as ONE root node has children', () => {
        expect(mapTreeNodesToSplitSource([_node('draft'), _node('categories', {childrenCount: 3})])).toEqual({
            options: [],
            unavailableReasonKey: COLUMN_SPLIT_UNAVAILABLE.multiLevelTree,
        });
    });

    it('reports an empty tree as having no value to split into', () => {
        expect(mapTreeNodesToSplitSource([])).toEqual({
            options: [],
            unavailableReasonKey: COLUMN_SPLIT_UNAVAILABLE.noValues,
        });
    });
});
