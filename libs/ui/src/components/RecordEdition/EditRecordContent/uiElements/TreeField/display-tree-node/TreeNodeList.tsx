// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {type RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {type RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import TreeNodeItem from './TreeNodeItem';
import {TreeFieldWrapper} from './TreeFieldWrapper';

interface IDisplayTreeNodeProps {
    attribute: RecordFormAttributeTreeAttributeFragment;
    backendValues: RecordFormElementsValueTreeValue[];
    removeTreeNode: (nodeValue: RecordFormElementsValueTreeValue) => void;
    isReadOnly: boolean;
}

export const TreeNodeList: FunctionComponent<IDisplayTreeNodeProps> = ({
    attribute,
    backendValues,
    removeTreeNode,
    isReadOnly,
}) => (
    <TreeFieldWrapper>
        {backendValues.map((value, index) => (
            <TreeNodeItem
                key={index}
                isReadOnly={isReadOnly}
                color={value.treeValue.record.whoAmI.color}
                label={value.treeValue.record.whoAmI.label}
                ancestors={value.treeValue.ancestors}
                canDelete={
                    !isReadOnly &&
                    ((attribute.required && attribute.multiple_values && backendValues.length > 1) ||
                        !attribute.required)
                }
                onClickToDelete={() => removeTreeNode(value)}
            />
        ))}
    </TreeFieldWrapper>
);
