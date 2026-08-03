import {useMemo} from 'react';
import {useKanbanTransitionsQuery} from '_ui/_gqlTypes';
import {buildTransitionsMap, type KanbanTransitionsMap} from './buildTransitionsMap';

/**
 * Loads the axis attribute's workflow transitions once per board: `tree_values` returns, for each
 * source node (including the `node: null` "no value" entry), the target nodes a value may move to
 * (`allowedDependentValues`). This is the same server contract the mass edition relies on.
 *
 * Phase-1 limitation: the query is sent without `attributeDependentValue`, so for workflows that
 * also depend on another attribute the upfront gating is approximate — the engine keeps enforcing
 * permissions on write and the drop falls back to rollback + alert.
 */
export const useKanbanTransitions = ({
    attributeId,
    skip,
}: {
    attributeId: string;
    skip: boolean;
}): {
    isLoading: boolean;
    canEditAxisValues: boolean;
    /** `null` = unrestricted (no self-dependency workflow on the axis attribute). */
    transitionsByNodeId: KanbanTransitionsMap | null;
} => {
    const {data, loading} = useKanbanTransitionsQuery({skip, variables: {attributeId}});

    const axisAttribute = data?.attributes?.list?.[0];
    const treeValues = axisAttribute && 'tree_values' in axisAttribute ? axisAttribute.tree_values : null;

    const transitionsByNodeId = useMemo(() => (treeValues ? buildTransitionsMap(treeValues) : null), [treeValues]);

    return {
        isLoading: loading,
        canEditAxisValues: axisAttribute?.permissions.edit_value ?? false,
        transitionsByNodeId,
    };
};
