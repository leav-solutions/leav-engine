import {useState, type FunctionComponent} from 'react';
import {type ITreeMapElement} from './_types';
import {KitButton, KitIdCard, KitTag, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faFolder} from '@fortawesome/free-solid-svg-icons';
import {type ITreeNodeWithRecord} from '_ui/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {LibraryBehavior} from '_ui/_gqlTypes';
import {getFileTypeIcon} from '_ui/_utils/getFileTypeIcon';
import {treeNodeLine, treeNodeLineSection} from './TreeNodeTitle.module.css';

interface ITreeNodeTitleProps {
    checkable: boolean;
    disabledNodes: string[];
    node: ITreeMapElement;
    onSelect: (node: ITreeNodeWithRecord, selected: boolean) => void;
    selectedNodes: string[];
    showSelectChildrenButton: boolean;
    showNodeTypeIcon?: boolean;
}

export const TreeNodeTitle: FunctionComponent<ITreeNodeTitleProps> = ({
    checkable,
    disabledNodes,
    node,
    onSelect,
    selectedNodes,
    showSelectChildrenButton,
    showNodeTypeIcon = false,
}) => {
    const {t} = useSharedTranslation();

    const [hover, setHover] = useState(false);

    const isSelected = selectedNodes.includes(node.id) && !node.isShowMore;
    // Fall back on `disabledNodes`: the synthetic root node carries no `disabled` flag.
    const isDisabled = node.disabled ?? disabledNodes.includes(node.id);

    const buttonInSelectMode = node.children
        .filter(child => !child.isShowMore && !disabledNodes.includes(child.id))
        .every(child => !selectedNodes.includes(child.id));

    const handleChildrenSelection = (event: React.MouseEvent) => {
        event.stopPropagation();
        node.children.forEach(child => {
            if (node.disabled || child.disabled || child.isShowMore) {
                return;
            }
            onSelect(child, buttonInSelectMode);
        });
    };

    return (
        <div className={treeNodeLine} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className={treeNodeLineSection}>
                {showNodeTypeIcon && node.record && (
                    <FontAwesomeIcon
                        icon={
                            node.libraryBehavior === LibraryBehavior.directories
                                ? faFolder
                                : getFileTypeIcon(node.title as string)
                        }
                        color={isDisabled ? 'var(--general-utilities-text-disabled)' : undefined}
                    />
                )}
                <KitTypography.Text size="fontSize5" disabled={isDisabled}>
                    {node.title}
                </KitTypography.Text>
                <SelectedChildrenCount node={node} selectedNodes={selectedNodes} />
            </div>
            <div className={treeNodeLineSection}>
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
            </div>
        </div>
    );
};

const SelectedChildrenCount: FunctionComponent<{
    node: ITreeMapElement;
    selectedNodes: string[];
}> = ({node, selectedNodes}) => {
    const selectedChildrenCount = countSelectedNodes(node, selectedNodes);

    return selectedChildrenCount > 0 ? (
        <KitTag>
            <KitIdCard description={selectedChildrenCount} />
        </KitTag>
    ) : null;
};

const countSelectedNodes = (node: ITreeMapElement, selectedNodes: string[]): number =>
    node.children?.reduce((count, child) => {
        if (selectedNodes.includes(child.id) && !child.isShowMore) {
            count += 1;
        }
        count += countSelectedNodes(child, selectedNodes);
        return count;
    }, 0) ?? 0;
