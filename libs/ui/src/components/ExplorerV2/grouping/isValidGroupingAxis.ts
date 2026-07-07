import {AttributeType} from '_ui/_gqlTypes';

/**
 * Minimal attribute shape needed to decide grouping-axis eligibility. Kept structural (not a generated
 * type) so both consumers — the app-studio kanban axis picker and the ExplorerV2 table grouping — can
 * feed their own fetched attribute without coupling to a specific query's generated type. `type` is a
 * plain string to avoid nominal-enum friction across the two apps' generated `AttributeType`s.
 */
export interface IGroupingAxisCandidate {
    type: string;
    values_list?: {enable?: boolean | null; allowFreeEntry?: boolean | null} | null;
}

/**
 * V1 grouping-axis eligibility (ADR-007). An attribute can drive a grouping axis (kanban columns, table
 * grouping) iff it has a FINITE value set:
 * - a `tree` attribute (columns = tree nodes), or
 * - any attribute whose values list is enabled AND closed (`!allowFreeEntry`) — columns = those values.
 *
 * Shared by the kanban axis picker and the table grouping so both agree on what a valid axis is.
 */
export const isValidGroupingAxis = (attribute: IGroupingAxisCandidate): boolean =>
    attribute.type === AttributeType.tree ||
    Boolean(attribute.values_list?.enable && !attribute.values_list.allowFreeEntry);
