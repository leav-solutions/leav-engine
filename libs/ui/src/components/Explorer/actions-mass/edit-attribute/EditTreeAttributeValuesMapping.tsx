// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitLoader, KitSpace} from 'aristid-ds';
import {type RecordFilterInput} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useTreeNodesCandidates} from './useTreeNodesCandidates';
import {TreeNodeRemap} from './TreeNodeRemap';
import {type MassEditableAttribute, type SetAttributeMapping} from './_types';

const EMPTY_VALUE_NODE_ID = null;

export const EditTreeAttributeValuesMapping = ({
    libraryId,
    attribute,
    dependencyAttributeId,
    dependencyAttributeNodeId,
    setAttributeMapping,
    massSelectionFilters,
}: {
    libraryId: string;
    attribute: MassEditableAttribute;
    dependencyAttributeId?: string;
    dependencyAttributeNodeId?: string;
    setAttributeMapping: SetAttributeMapping;
    massSelectionFilters: RecordFilterInput[];
}) => {
    const {t} = useSharedTranslation();

    const {candidateNodes, loading} = useTreeNodesCandidates({
        attributeId: attribute.id,
        dependencyAttributeId,
        dependencyAttributeNodeId,
        libraryId,
        massSelectionFilters,
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
                    candidateNodes={[
                        {id: EMPTY_VALUE_NODE_ID, label: t('explorer.massAction.editAttribute_value_do_not_change')},
                        ...remapping.allowedDependentValues,
                    ]}
                    setAttributeMapping={setAttributeMapping}
                />
            ))}
        </KitSpace>
    );
};
