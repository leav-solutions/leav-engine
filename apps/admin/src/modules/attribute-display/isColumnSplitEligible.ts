import {AttributeType} from '../../_gqlTypes';

/**
 * An attribute can offer the explorer's column split only if it exposes a closed, finite set of
 * possible values: a tree attribute, or any attribute whose values list is enabled and does not
 * allow free entry. Same rule as `isValidGroupingAxis` in @leav/ui (ADR-011), duplicated here
 * because admin must not depend on an ExplorerV2 internal.
 */
export const isColumnSplitEligible = (attribute: {
    type: AttributeType;
    values_list?: {enable?: boolean | null; allowFreeEntry?: boolean | null} | null;
}): boolean =>
    attribute.type === AttributeType.tree ||
    Boolean(attribute.values_list?.enable && !attribute.values_list.allowFreeEntry);
