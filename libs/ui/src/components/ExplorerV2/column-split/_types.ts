/**
 * One possible value of a splittable attribute = one sub-column. `key` identifies the sub-column and
 * matches values carried by a record; `rawValue` is what gets sent to `saveValueBatch`. They differ for
 * tree attributes: a record's value exposes the NODE id, and that is also what the engine expects on
 * write — but the label/color come from the node's record, hence the distinction is kept explicit
 * rather than assumed equal.
 */
export interface IColumnSplitOption {
    key: string;
    label: string;
    color?: string | null;
    rawValue: string;
}

/**
 * A splittable column's resolved sub-columns — or the reason it cannot be split. `unavailableReasonKey`
 * is an i18n key (see `_constants.ts`) rather than a translated string, so resolving a source stays pure;
 * `TableView` translates it into the disabled split button's tooltip. An empty `options` with no reason
 * means "not resolved yet" (a tree's root nodes are still loading).
 */
export interface IColumnSplitSource {
    options: IColumnSplitOption[];
    unavailableReasonKey?: string;
}

/**
 * The view-level column split state, owned by `Explorer.tsx` (view settings) and consumed by
 * `table/TableView` only — column split is out of scope for the kanban, hence a `TableView` prop
 * rather than a member of the shared `IDataViewChildProps`.
 */
export interface IColumnSplit {
    splitAttributeIds: string[];
    toggleSplit: (attributeId: string) => void;
    /** Mirrors item actions: inline edition is disabled during a "select all" mass selection. */
    isEditionDisabled: boolean;
}
