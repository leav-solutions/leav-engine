/**
 * Structural subset of the `KanbanTransitions` query result (`tree_values`), kept local so the pure
 * helper does not depend on the generated types.
 */
export interface IKanbanTransitionsTreeValue {
    node?: {id: string} | null;
    allowedDependentValues?: Array<{nodeId?: string | null}> | null;
}

/**
 * Allowed workflow transitions, keyed by source node id (`null` key = the "no value" source — the core
 * always pushes a `node: null` entry in `tree_values`). A `null` map value means the source is
 * unrestricted (no self-dependency workflow): every target is allowed. A `null` inside a target set
 * means clearing the value is an allowed transition (the core excludes it on required attributes).
 */
export type KanbanTransitionsMap = ReadonlyMap<string | null, ReadonlySet<string | null> | null>;

export const buildTransitionsMap = (treeValues: IKanbanTransitionsTreeValue[]): KanbanTransitionsMap => {
    const transitionsBySourceNodeId = new Map<string | null, ReadonlySet<string | null> | null>();

    for (const treeValue of treeValues) {
        const sourceNodeId = treeValue.node?.id ?? null;
        transitionsBySourceNodeId.set(
            sourceNodeId,
            treeValue.allowedDependentValues == null
                ? null
                : new Set(treeValue.allowedDependentValues.map(({nodeId}) => nodeId ?? null)),
        );
    }

    return transitionsBySourceNodeId;
};
