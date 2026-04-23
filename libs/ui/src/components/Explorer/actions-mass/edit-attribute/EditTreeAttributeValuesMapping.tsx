// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitLoader, KitSpace} from 'aristid-ds';
import {type RecordFilterInput} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useValuesDistribution} from './useValuesDistribution';
import {useTreeNodeRemapping} from './useTreeNodeRemapping';
import {TreeNodeRemap} from './TreeNodeRemap';
import {type MassEditableAttribute, type SetAttributeMapping} from './_types';

const UNDEFINED_NODE_ID = null;

export const EditTreeAttributeValuesMapping = ({
    libraryId,
    attribute,
    setAttributeMapping,
    massSelectionFilters,
}: {
    libraryId: string;
    attribute: MassEditableAttribute;
    setAttributeMapping: SetAttributeMapping;
    massSelectionFilters: RecordFilterInput[];
}) => {
    const {t} = useSharedTranslation();

    const {distribution, noValueCount, loading} = useValuesDistribution({
        attributeId: attribute.id,
        libraryId,
        recordFilters: massSelectionFilters,
    });

    const noValueNode = attribute.treeNodes.find(({id}) => id === UNDEFINED_NODE_ID) ?? null;
    const editableNodes = attribute.treeNodes.filter(({id}) => id !== UNDEFINED_NODE_ID);

    const remappingList = useTreeNodeRemapping({distribution, editableNodes});

    if (loading) {
        return <KitLoader />;
    }

    return (
        <KitSpace direction="vertical" size="xs" style={{display: 'flex'}}>
            {remappingList.map(remapping => (
                <TreeNodeRemap
                    key={remapping.currentNode.id}
                    {...remapping}
                    setAttributeMapping={setAttributeMapping}
                />
            ))}
            {noValueCount > 0 && noValueNode !== null && (
                <TreeNodeRemap
                    currentNode={noValueNode}
                    occurrenceCount={noValueCount}
                    candidateNodes={[
                        {id: UNDEFINED_NODE_ID, label: t('explorer.massAction.editAttribute_value_do_not_change')},
                        ...editableNodes,
                    ]}
                    setAttributeMapping={setAttributeMapping}
                />
            )}
        </KitSpace>
    );
};
