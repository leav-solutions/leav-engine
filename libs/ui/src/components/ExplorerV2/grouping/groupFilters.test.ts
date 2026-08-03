import {RecordFilterCondition, RecordFilterOperator, type RecordFilterInput} from '_ui/_gqlTypes';
import {appendGroupFilter, buildNoValueGroupFilter, buildTreeGroupEqualityFilter} from './groupFilters';

const AXIS = 'status';

describe('buildTreeGroupEqualityFilter', () => {
    it('builds the 3-segment equality filter targeting the node record id', () => {
        expect(
            buildTreeGroupEqualityFilter({attributeId: AXIS, nodeLibraryId: 'statuses', nodeRecordId: 'draft'}),
        ).toEqual({
            field: 'status.statuses.id',
            condition: RecordFilterCondition.EQUAL,
            value: 'draft',
        });
    });
});

describe('buildNoValueGroupFilter', () => {
    it('builds the empty-value filter on the bare attribute', () => {
        expect(buildNoValueGroupFilter(AXIS)).toEqual({
            field: AXIS,
            condition: RecordFilterCondition.IS_EMPTY,
        });
    });
});

describe('appendGroupFilter', () => {
    const groupFilter = buildNoValueGroupFilter(AXIS);

    it('returns the group filter alone when the view has no filters', () => {
        expect(appendGroupFilter([], groupFilter)).toEqual([groupFilter]);
    });

    it('brackets the view filters before ANDing the group filter', () => {
        const viewFilterA: RecordFilterInput = {field: 'a', condition: RecordFilterCondition.EQUAL, value: '1'};
        const viewFilterB: RecordFilterInput = {field: 'b', condition: RecordFilterCondition.EQUAL, value: '2'};

        expect(appendGroupFilter([viewFilterA, {operator: RecordFilterOperator.OR}, viewFilterB], groupFilter)).toEqual(
            [
                {operator: RecordFilterOperator.OPEN_BRACKET},
                viewFilterA,
                {operator: RecordFilterOperator.OR},
                viewFilterB,
                {operator: RecordFilterOperator.CLOSE_BRACKET},
                {operator: RecordFilterOperator.AND},
                groupFilter,
            ],
        );
    });
});
