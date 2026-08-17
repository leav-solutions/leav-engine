import {KitLoader, KitSpace} from 'aristid-ds';
import {type RecordFilterInput} from '_ui/_gqlTypes';
import {useTreeNodesCandidates} from './useTreeNodesCandidates';
import {TreeNodeRemap} from './TreeNodeRemap';
import {type MassEditableAttribute, type SetAttributeMapping} from './_types';

export const EditTreeAttributeValuesMapping = ({
    libraryId,
    attribute,
    dependencyAttributeId,
    dependencyAttributeNodeId,
    setAttributeMapping,
    massSelectionFilters,
    massSelectionSearchQuery,
}: {
    libraryId: string;
    attribute: MassEditableAttribute;
    dependencyAttributeId?: string;
    dependencyAttributeNodeId?: string;
    setAttributeMapping: SetAttributeMapping;
    massSelectionFilters: RecordFilterInput[];
    massSelectionSearchQuery?: string;
}) => {
    const {candidateNodes, loading} = useTreeNodesCandidates({
        attributeId: attribute.id,
        dependencyAttributeId,
        dependencyAttributeNodeId,
        libraryId,
        massSelectionFilters,
        massSelectionSearchQuery,
    });

    if (loading) {
        return <KitLoader />;
    }

    return (
        <KitSpace direction="vertical" size="xs" style={{display: 'flex'}}>
            {candidateNodes.map(remapping => (
                <TreeNodeRemap
                    key={remapping.currentNode.id ?? 'empty'}
                    currentNode={remapping.currentNode}
                    occurrenceCount={remapping.occurrenceCount}
                    candidateNodes={remapping.allowedDependentValues}
                    setAttributeMapping={setAttributeMapping}
                />
            ))}
        </KitSpace>
    );
};
