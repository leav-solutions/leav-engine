import {type RecordFilterInput, useTreeAttributeRemappingQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

export const useTreeNodesCandidates = ({
    attributeId,
    dependencyAttributeId,
    dependencyAttributeNodeId,
    libraryId,
    massSelectionFilters,
}: {
    attributeId: string;
    dependencyAttributeId?: string;
    dependencyAttributeNodeId?: string;
    libraryId: string;
    massSelectionFilters: RecordFilterInput[];
}): {
    candidateNodes: Array<{
        currentNode: {
            id: string | null;
            label: string;
            color?: string | null;
        };
        occurrenceCount: number;
        allowedDependentValues: Array<{
            id: string;
            label: string;
            color?: string | null;
        }>;
    }>;
    loading: boolean;
} => {
    const {t} = useSharedTranslation();

    const {data, loading} = useTreeAttributeRemappingQuery({
        variables: {
            attributeId,
            libraryId,
            recordFilters: massSelectionFilters,
            attributeDependentValue: dependencyAttributeId
                ? {
                      attributeId: dependencyAttributeId,
                      nodeId: dependencyAttributeNodeId,
                  }
                : undefined,
        },
    });

    const nodeOccurrences = (data?.listDistinctValues ?? []).map(treeOccurrence => ({
        count: treeOccurrence.count,
        treeNodeId: 'treeNode' in treeOccurrence && treeOccurrence.treeNode ? treeOccurrence.treeNode.id : null,
    }));

    const treeValuesRemappingTarget =
        data?.attributes?.list && data.attributes.list.length === 1 ? data.attributes.list[0] : null;

    const remappableNodes = (treeValuesRemappingTarget?.tree_values ?? [])
        .map(({node}) => node)
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .map(node => ({
            id: node.id,
            label: node.record.whoAmI.label ?? '',
            color: node.record.whoAmI.color,
        }));

    const candidateNodes =
        treeValuesRemappingTarget === null
            ? []
            : nodeOccurrences
                  .map(occurrence => {
                      const treeValue = treeValuesRemappingTarget.tree_values?.find(
                          ({node}) => (node?.id ?? null) === occurrence.treeNodeId,
                      );
                      if (!treeValue) {
                          return null;
                      }

                      return {
                          currentNode:
                              occurrence.treeNodeId === null
                                  ? {
                                        id: null,
                                        label: t('explorer.massAction.editAttribute_value_undefined'),
                                        color: undefined,
                                    }
                                  : {
                                        id: occurrence.treeNodeId,
                                        label: treeValue.node?.record.whoAmI.label ?? '',
                                        color: treeValue.node?.record.whoAmI.color,
                                    },
                          occurrenceCount: occurrence.count,
                          allowedDependentValues:
                              treeValue.allowedDependentValues == null
                                  ? remappableNodes
                                  : treeValue.allowedDependentValues
                                        .map(
                                            allowedValue =>
                                                remappableNodes.find(({id}) => id === allowedValue.nodeId) ?? null,
                                        )
                                        .filter((x): x is NonNullable<typeof x> => x !== null),
                      };
                  })
                  .filter((x): x is NonNullable<typeof x> => x !== null);

    return {
        candidateNodes,
        loading,
    };
};
