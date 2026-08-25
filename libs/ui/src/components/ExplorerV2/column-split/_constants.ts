/**
 * i18n keys explaining why a column flagged splittable cannot actually be split right now — rendered as
 * the disabled split button's tooltip. Kept as keys (not translated strings) so the resolution of a
 * column's sub-columns stays a pure, `t`-free concern.
 */
export const COLUMN_SPLIT_UNAVAILABLE = {
    /** The closed values list was emptied or opened up since the admin flagged the attribute. */
    noValues: 'explorer.column_split.unavailable_no_values',
    /** A tree attribute whose linked tree has more than one level (out of scope, LEAVC-1074). */
    multiLevelTree: 'explorer.column_split.unavailable_multi_level_tree',
    /** The linked tree's root nodes could not be fetched. */
    optionsError: 'explorer.column_split.unavailable_options_error',
} as const;
