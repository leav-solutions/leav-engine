// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState, type FunctionComponent} from 'react';
import {type ITreeMapElement} from './_types';
import {KitButton, KitTag, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import {type ITreeNodeWithRecord} from '_ui/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import styled from 'styled-components';

const TreeNodeLine = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;
const TreeNodeLineSection = styled.div`
    display: flex;
    align-items: center;
    gap: calc(var(--general-spacing-xs) * 1px);
`;
interface ITreeNodeTitleProps {
    checkable: boolean;
    disabledNodes: string[];
    loadRecursively: boolean;
    node: ITreeMapElement;
    onSelect: (node: ITreeNodeWithRecord, selected: boolean) => void;
    selectedNodes: string[];
    showSelectChildrenButton: boolean;
}

export const TreeNodeTitle: FunctionComponent<ITreeNodeTitleProps> = ({
    checkable,
    disabledNodes,
    loadRecursively,
    node,
    onSelect,
    selectedNodes,
    showSelectChildrenButton,
}) => {
    const {t} = useSharedTranslation();

    const [hover, setHover] = useState(false);

    const isSelected = selectedNodes.includes(node.id) && !node.isShowMore;
    const isDisabled = disabledNodes.includes(node.id);

    const buttonInSelectMode = node.children
        .filter(child => !child.isShowMore && !disabledNodes.includes(child.id))
        .every(child => !selectedNodes.includes(child.id));

    const handleChildrenSelection = (event: React.MouseEvent) => {
        event.stopPropagation();
        node.children.forEach(child => {
            if (node.disabled || child.isShowMore) {
                return;
            }
            onSelect(child, buttonInSelectMode);
        });
    };

    return (
        <TreeNodeLine onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <TreeNodeLineSection>
                <KitTypography.Text size="fontSize5" disabled={isDisabled}>
                    {node.title}
                </KitTypography.Text>
                <SelectedChildrenCount node={node} selectedNodes={selectedNodes} loadRecursively={loadRecursively} />
            </TreeNodeLineSection>
            <TreeNodeLineSection>
                {showSelectChildrenButton && node.children.length > 0 && hover && (
                    <KitButton size="s" onClick={e => handleChildrenSelection(e)}>
                        {t(`tree-node-selection.${buttonInSelectMode ? 'select_children' : 'unselect_children'}`)}
                    </KitButton>
                )}
                {!checkable && isSelected && (
                    <FontAwesomeIcon
                        icon={faCheck}
                        color={
                            isDisabled ? 'var(--general-utilities-text-disabled)' : 'var(--general-utilities-text-blue)'
                        }
                    />
                )}
            </TreeNodeLineSection>
        </TreeNodeLine>
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
