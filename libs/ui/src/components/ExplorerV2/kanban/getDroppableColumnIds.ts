import {type IKanbanColumn} from '../grouping/_types';
import {type KanbanTransitionsMap} from './buildTransitionsMap';

/**
 * Columns a dragged card may be dropped on, computed upfront from the axis attribute's workflow
 * (`allowedDependentValues`) so forbidden transitions are not attemptable (plan §5.4).
 *
 * - The source column is never droppable (the core already excludes a node from its own targets).
 * - The "no value" column (nodeId `null`) is droppable only when clearing the value is an allowed
 *   transition (`null` present in the target set, or unrestricted source).
 * - A missing source entry falls back to unrestricted: this covers orphan-value cards grouped under
 *   "no value" (their actual node is not a root of the axis tree). The engine + rollback stay
 *   authoritative on drop anyway.
 */
export const getDroppableColumnIds = ({
    columns,
    sourceColumn,
    transitionsByNodeId,
}: {
    columns: IKanbanColumn[];
    sourceColumn: IKanbanColumn;
    transitionsByNodeId: KanbanTransitionsMap | null;
}): ReadonlySet<string> => {
    const allowedTargetNodeIds = transitionsByNodeId?.get(sourceColumn.nodeId) ?? null;

    return new Set(
        columns
            .filter(column => column.id !== sourceColumn.id)
            .filter(column => allowedTargetNodeIds === null || allowedTargetNodeIds.has(column.nodeId))
            .map(column => column.id),
    );
};
