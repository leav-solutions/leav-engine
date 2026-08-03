import {mapDistinctValuesToCounts} from './mapDistinctValuesToCounts';
import {type ListDistinctValuesQuery} from '_ui/_gqlTypes';

type DistinctValuesList = NonNullable<ListDistinctValuesQuery['listDistinctValues']>;

// Minimal tree group as returned by listDistinctValues on a tree axis (value = node, keyed by its record).
const treeGroup = (nodeRecordId: string, count: number, libraryId = 'statuses'): DistinctValuesList[number] => ({
    count,
    value: {
        id: `node-${nodeRecordId}`,
        record: {
            id: nodeRecordId,
            whoAmI: {id: nodeRecordId, label: nodeRecordId, color: null, library: {id: libraryId}},
        },
    },
});

const noValueGroup = (count: number): DistinctValuesList[number] => ({count, value: null});

describe('mapDistinctValuesToCounts', () => {
    describe('counts keyed by the node record id', () => {
        it('maps each tree group count under its node record id', () => {
            const {countByNodeRecordId} = mapDistinctValuesToCounts([treeGroup('draft', 3), treeGroup('validated', 7)]);

            expect(countByNodeRecordId).toEqual({draft: 3, validated: 7});
        });
    });

    describe('node library map', () => {
        it('maps each node record id to its library, read from the group value (trees can mix libraries)', () => {
            const {libraryIdByNodeRecordId} = mapDistinctValuesToCounts([
                treeGroup('draft', 3, 'statuses'),
                treeGroup('validated', 7, 'other_statuses'),
            ]);

            expect(libraryIdByNodeRecordId).toEqual({draft: 'statuses', validated: 'other_statuses'});
        });

        it('leaves the null bucket out of the library map', () => {
            const {libraryIdByNodeRecordId} = mapDistinctValuesToCounts([treeGroup('draft', 3), noValueGroup(5)]);

            expect(libraryIdByNodeRecordId).toEqual({draft: 'statuses'});
        });
    });

    describe('null bucket', () => {
        it('routes the null-value group to noValueCount', () => {
            const {countByNodeRecordId, noValueCount} = mapDistinctValuesToCounts([
                treeGroup('draft', 3),
                noValueGroup(5),
            ]);

            expect(noValueCount).toBe(5);
            expect(countByNodeRecordId).toEqual({draft: 3});
        });
    });

    describe('absent groups', () => {
        it('returns zero noValueCount and no entry when a value has no group', () => {
            const {countByNodeRecordId, noValueCount} = mapDistinctValuesToCounts([treeGroup('draft', 3)]);

            expect(noValueCount).toBe(0);
            expect(countByNodeRecordId.validated).toBeUndefined();
        });
    });
});
