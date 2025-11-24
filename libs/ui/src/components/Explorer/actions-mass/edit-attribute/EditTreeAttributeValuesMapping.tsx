// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AttributeDetailsTreeAttributeFragment} from '_ui/_gqlTypes';
import {KitSpace} from 'aristid-ds';
import {type FunctionComponent} from 'react';
import {type ValuesOccurrences} from './useCountValuesOccurrencesHook';
import {useListTreeAttributeValuesHook} from './useListTreeAttributeValuesHook';
import {EditTreeAttributeValueLine} from './EditTreeAttributeValueLine';

export const EditTreeAttributeValuesMapping: FunctionComponent<{
    selectedAttribute: AttributeDetailsTreeAttributeFragment;
    valuesOccurrences: ValuesOccurrences;
    setAttributeMapping: (before: string | null, after: string | null) => void;
}> = ({selectedAttribute, valuesOccurrences, setAttributeMapping}) => {
    const treeAttributeValues = useListTreeAttributeValuesHook({treeAttribute: selectedAttribute});
    const {occurrences, noValueCount} = valuesOccurrences;

    return (
        <KitSpace direction="vertical" size="xs" style={{display: 'flex'}}>
            {treeAttributeValues.map((nodeForOccurrence, index) => {
                const occurrence = occurrences.find(occ => occ.value.id === nodeForOccurrence.id);
                if (!occurrence) {
                    return null;
                }
                return (
                    <EditTreeAttributeValueLine
                        key={index}
                        treeNodeValues={treeAttributeValues}
                        selectedAttribute={selectedAttribute}
                        valueOccurrenceNodeId={occurrence.value.id}
                        valueOccurrenceCount={occurrence.count}
                        setAttributeMapping={setAttributeMapping}
                    />
                );
            })}
            {noValueCount > 0 && (
                <EditTreeAttributeValueLine
                    treeNodeValues={treeAttributeValues}
                    selectedAttribute={selectedAttribute}
                    valueOccurrenceNodeId={null}
                    valueOccurrenceCount={noValueCount}
                    setAttributeMapping={setAttributeMapping}
                />
            )}
        </KitSpace>
    );
};
