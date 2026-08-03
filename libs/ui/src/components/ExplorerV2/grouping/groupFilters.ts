import {RecordFilterCondition, RecordFilterOperator, type RecordFilterInput} from '_ui/_gqlTypes';

interface IBuildTreeGroupEqualityFilterParams {
    attributeId: string;
    /** Library of the group's tree node — trees can mix libraries, so it comes from the node itself. */
    nodeLibraryId: string;
    /** RECORD id of the group's tree node (NODE_RECORD_ID_FIELD core-side), not the node id. */
    nodeRecordId: string;
}

/**
 * Equality filter selecting the records of one tree-axis group. The field is the 3-segment path
 * `<attribute>.<nodeLibrary>.id` — a bare or 2-segment field does not resolve tree values core-side.
 */
export const buildTreeGroupEqualityFilter = ({
    attributeId,
    nodeLibraryId,
    nodeRecordId,
}: IBuildTreeGroupEqualityFilterParams): RecordFilterInput => ({
    field: `${attributeId}.${nodeLibraryId}.id`,
    condition: RecordFilterCondition.EQUAL,
    value: nodeRecordId,
});

/** Filter selecting the records carrying no value for the axis attribute (the "no value" column). */
export const buildNoValueGroupFilter = (attributeId: string): RecordFilterInput => ({
    field: attributeId,
    condition: RecordFilterCondition.IS_EMPTY,
});

/**
 * ANDs a group filter after the view filters, bracketing the view filters so their own operators
 * (possibly OR) cannot leak: `[OPEN_BRACKET, ...viewFilters, CLOSE_BRACKET, AND, groupFilter]`.
 */
export const appendGroupFilter = (
    viewFilters: RecordFilterInput[],
    groupFilter: RecordFilterInput,
): RecordFilterInput[] =>
    viewFilters.length === 0
        ? [groupFilter]
        : [
              {operator: RecordFilterOperator.OPEN_BRACKET},
              ...viewFilters,
              {operator: RecordFilterOperator.CLOSE_BRACKET},
              {operator: RecordFilterOperator.AND},
              groupFilter,
          ];
