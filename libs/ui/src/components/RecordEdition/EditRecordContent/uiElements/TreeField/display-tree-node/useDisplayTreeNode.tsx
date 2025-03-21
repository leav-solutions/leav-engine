// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import TreeNodeItem from './TreeNodeItem';
import {RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import {TreeFieldWrapper} from './TreeFieldWrapper';

interface IUseDisplayTreeNodeProps {
    attribute: RecordFormAttributeTreeAttributeFragment;
    backendValues: RecordFormElementsValueTreeValue[];
    removeTreeNode: (nodeValue: RecordFormElementsValueTreeValue) => void;
}

export const useDisplayTreeNode = ({attribute, backendValues, removeTreeNode}: IUseDisplayTreeNodeProps) => ({
    TreeNodeList: (
        <TreeFieldWrapper>
            {backendValues.map((value, index) => (
                <TreeNodeItem
                    key={index}
                    color={value.treeValue.record.whoAmI.color}
                    label={value.treeValue.record.whoAmI.label}
                    ancestors={value.treeValue.ancestors}
                    canDelete={
                        (attribute.required && attribute.multiple_values && backendValues.length > 1) ||
                        (!attribute.required && attribute.multiple_values)
                    }
                    onClickToDelete={() => removeTreeNode(value)}
                />
            ))}
        </TreeFieldWrapper>
    )
});
