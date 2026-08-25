import {type AttributeProperties} from '../_types';

/**
 * A column offers the split button only when the admin enabled it on the attribute
 * (`column_split_enabled`, LEAVC-1075). The ADR-011 closed-values-list predicate
 * (`isValidGroupingAxis`, `../grouping/isValidGroupingAxis.ts`) is deliberately NOT reapplied here:
 * core's `attributeValidationHelper` already guarantees `column_split_enabled` can only be `true` on a
 * tree attribute or one with a closed values list, so re-deriving eligibility front-side would only
 * add a second, divergeable source of truth.
 *
 * If the list is opened up or emptied after the fact, `getColumnSplitOptions` resolves 0 options and
 * `TableView` disables the button with an explanatory tooltip instead of hiding it.
 */
export const isColumnSplittable = (attribute: AttributeProperties): boolean => Boolean(attribute.column_split_enabled);
