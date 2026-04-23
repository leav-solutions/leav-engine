// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type MassEditTreeNode} from './_types';

export const useTreeNodeRemapping = ({
    distribution,
    editableNodes,
}: {
    distribution: Array<{count: number; treeNodeId: string}>;
    editableNodes: MassEditTreeNode[];
}): Array<{
    currentNode: MassEditTreeNode;
    occurrenceCount: number;
    candidateNodes: MassEditTreeNode[];
}> => {
    const {t} = useSharedTranslation();

    return distribution.map(occurrence => {
        const currentNode = editableNodes.find(({id}) => id === occurrence.treeNodeId)!;

        const filteredCandidates = editableNodes
            .filter(({id}) => id !== currentNode.id)
            .filter(
                candidate =>
                    currentNode.allowedDependentNodeIds &&
                    (currentNode.allowedDependentNodeIds.length === 0 ||
                        currentNode.allowedDependentNodeIds.includes(candidate.id!)),
            );

        return {
            currentNode,
            occurrenceCount: occurrence.count,
            candidateNodes: [
                {id: occurrence.treeNodeId, label: t('explorer.massAction.editAttribute_value_do_not_change')},
                ...filteredCandidates,
            ],
        };
    });
};
