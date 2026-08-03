import {buildTransitionsMap} from './buildTransitionsMap';

describe('buildTransitionsMap', () => {
    it('maps each source node to the set of its allowed target node ids', () => {
        const map = buildTransitionsMap([
            {node: {id: 'draft'}, allowedDependentValues: [{nodeId: 'review'}, {nodeId: 'validated'}]},
            {node: {id: 'review'}, allowedDependentValues: [{nodeId: 'validated'}]},
        ]);

        expect(map.get('draft')).toEqual(new Set(['review', 'validated']));
        expect(map.get('review')).toEqual(new Set(['validated']));
    });

    it('keys the "no value" source entry under null', () => {
        const map = buildTransitionsMap([{node: null, allowedDependentValues: [{nodeId: 'draft'}]}]);

        expect(map.get(null)).toEqual(new Set(['draft']));
    });

    it('marks a source as unrestricted when allowedDependentValues is null', () => {
        const map = buildTransitionsMap([{node: {id: 'draft'}, allowedDependentValues: null}]);

        expect(map.has('draft')).toBe(true);
        expect(map.get('draft')).toBeNull();
    });

    it('keeps a null target in the set when clearing the value is allowed', () => {
        const map = buildTransitionsMap([
            {node: {id: 'validated'}, allowedDependentValues: [{nodeId: 'draft'}, {nodeId: null}]},
        ]);

        expect(map.get('validated')?.has(null)).toBe(true);
    });
});
