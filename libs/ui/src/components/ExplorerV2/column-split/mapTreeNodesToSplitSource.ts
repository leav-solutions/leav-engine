import {COLUMN_SPLIT_UNAVAILABLE} from './_constants';
import {type IColumnSplitOption, type IColumnSplitSource} from './_types';

/**
 * The subset of `TreeNodeChildFragment` this mapping needs. Declared structurally rather than `Pick`ed so
 * the contract reads as "a node id, whether it has children, and its record's identity" — nothing else of
 * the (much larger) tree-nodes fragment is involved.
 */
export interface ITreeSplitNode {
    id: string;
    childrenCount?: number | null;
    record: {whoAmI: {label?: string | null; color?: string | null}};
}

/**
 * The root nodes of a tree attribute's linked tree, mapped to one sub-column each (LEAVC-1074).
 *
 * ⚠️ Identity: an option's key is the NODE id, never the node's record id — the same record can be
 * attached to several nodes, and the node is both what a record's value carries (`treePayload.id`) and
 * what `saveValueBatch` expects on write. The kanban pairs its cards on `treePayload.record.id` instead
 * (`grouping/buildKanbanColumns.ts`) only because its fragment predates that `id`.
 *
 * Only a FLAT tree can be split (lot 1 scope): one level means one sub-column per node with nothing
 * hidden below it. As soon as ONE root node has children the whole attribute is declared unsplittable,
 * rather than silently splitting on the roots and losing their descendants.
 */
export const mapTreeNodesToSplitSource = (nodes: ITreeSplitNode[]): IColumnSplitSource => {
    if (nodes.some(node => (node.childrenCount ?? 0) > 0)) {
        return {options: [], unavailableReasonKey: COLUMN_SPLIT_UNAVAILABLE.multiLevelTree};
    }

    const options: IColumnSplitOption[] = nodes.map(node => ({
        key: node.id,
        label: node.record.whoAmI.label ?? node.id,
        color: node.record.whoAmI.color,
        rawValue: node.id,
    }));

    return options.length > 0 ? {options} : {options, unavailableReasonKey: COLUMN_SPLIT_UNAVAILABLE.noValues};
};
