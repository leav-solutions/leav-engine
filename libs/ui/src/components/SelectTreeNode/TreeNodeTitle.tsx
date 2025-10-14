// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {type ITreeMapElement} from './_types';
import {KitTag, KitTypography} from 'aristid-ds';
import {FaCheck} from 'react-icons/fa';

interface ITreeNodeTitleProps {
    checkable: boolean;
    disabledNodes: string[];
    loadRecursively: boolean;
    node: ITreeMapElement;
    selectedNodes: string[];
}

export const TreeNodeTitle: FunctionComponent<ITreeNodeTitleProps> = ({
    checkable,
    disabledNodes,
    loadRecursively,
    node,
    selectedNodes
}) => {
    const isSelected = selectedNodes?.includes(node.id) && !node.isShowMore;
    const isDisabled = disabledNodes?.includes(node.id);

    return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 'calc(var(--general-spacing-xs) * 1px)'}}>
                <KitTypography.Text size="fontSize5" disabled={isDisabled}>
                    {node.title}
                </KitTypography.Text>
                <SelectedChildrenCount node={node} selectedNodes={selectedNodes} loadRecursively={loadRecursively} />
            </div>
            {!checkable && isSelected && (
                <FaCheck
                    color={isDisabled ? 'var(--general-utilities-text-disabled)' : 'var(--general-utilities-text-blue)'}
                />
            )}
        </div>
    );
};

const SelectedChildrenCount: FunctionComponent<{
    node: ITreeMapElement;
    selectedNodes: string[];
    loadRecursively: boolean;
}> = ({node, selectedNodes, loadRecursively}) => {
    // it can work only if all children are loaded
    if (!loadRecursively) {
        return null;
    }

    const selectedChildrenCount = countSelectedNodes(node, selectedNodes);

    return selectedChildrenCount > 0 ? <KitTag idCardProps={{description: selectedChildrenCount}} /> : null;
};

const countSelectedNodes = (node: ITreeMapElement, selectedNodes: string[]): number =>
    node.children?.reduce((count, child) => {
        if (selectedNodes.includes(child.id) && !child.isShowMore) {
            count += 1;
        }
        count += countSelectedNodes(child, selectedNodes);
        return count;
    }, 0) ?? 0;
