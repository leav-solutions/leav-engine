import {type ListDistinctValuesQuery} from '_ui/_gqlTypes';

export interface IKanbanColumnCounts {
    /** Record count per column, keyed by the axis node's RECORD id (the kanban column key). */
    countByNodeRecordId: Record<string, number>;
    /**
     * Library of each axis node, keyed by its RECORD id. Read straight from the counts response so the
     * per-column card requests can build their group equality filter (`<attr>.<nodeLibrary>.id`) without
     * waiting on the separate tree-nodes query — the two resolve independently and counts win the race.
     */
    libraryIdByNodeRecordId: Record<string, string>;
    /** Record count of the "no axis value" bucket (listDistinctValues group with a null value). */
    noValueCount: number;
}

/**
 * Projects the listDistinctValues response onto the kanban column counts. On a tree axis every group is
 * a TreeDistinctValues; the null bucket is detected on `value` being null (not on the typename), as the
 * core types the null bucket like any other group of the attribute.
 */
export const mapDistinctValuesToCounts = (groups: ListDistinctValuesQuery['listDistinctValues']): IKanbanColumnCounts =>
    groups.reduce<IKanbanColumnCounts>(
        (acc, group) => {
            if ('value' in group && group.value !== null && group.value !== undefined) {
                acc.countByNodeRecordId[group.value.record.id] = group.count;
                acc.libraryIdByNodeRecordId[group.value.record.id] = group.value.record.whoAmI.library.id;
            } else {
                acc.noValueCount += group.count;
            }

            return acc;
        },
        {countByNodeRecordId: {}, libraryIdByNodeRecordId: {}, noValueCount: 0},
    );
