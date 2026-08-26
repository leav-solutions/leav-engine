import {faCheck, faCheckDouble, faFolder, faListCheck} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitButton, KitIdCard, KitTag, KitTooltip, KitTypography} from 'aristid-ds';
import {type FunctionComponent, type MouseEvent} from 'react';
import {LibraryBehavior} from '_ui/_gqlTypes';
import {getFileTypeIcon} from '_ui/_utils/getFileTypeIcon';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type ITreeSelectionNode, type ITreeSelectionNodesById} from '_ui/hooks/useTreeSelection';
import {groupButtons, treeNodeLine, treeNodeLineSection} from './treeNodeTitle.module.css';

interface ITreeNodeTitleProps {
    node: ITreeSelectionNode;
    nodesById: ITreeSelectionNodesById;
    getDescendants: (nodeId: string) => string[];
    checkable: boolean;
    selectedNodes: string[];
    showSelectChildrenButton: boolean;
    showSelectDescendantsButton: boolean;
    /** Opt-in: only a tree mixing directories and files needs to tell its node types apart. */
    showNodeTypeIcon?: boolean;
    /** Batched on purpose: a per-node callback would read a stale selection in checkable mode. */
    onGroupSelect: (nodes: ITreeSelectionNode[], selected: boolean) => void;
}

export const TreeNodeTitle: FunctionComponent<ITreeNodeTitleProps> = ({
    node,
    nodesById,
    getDescendants,
    checkable,
    selectedNodes,
    showSelectChildrenButton,
    showSelectDescendantsButton,
    showNodeTypeIcon = false,
    onGroupSelect,
}) => {
    const {t} = useSharedTranslation();

    const isSelected = selectedNodes.includes(node.id);

    // Groups actions only act on what the configuration actually allows to select
    const selectableChildren = node.children.filter(child => child.selectable);
    const selectableDescendants = getDescendants(node.id)
        .map(descendantId => nodesById[descendantId])
        .filter(descendant => descendant?.selectable);

    const childrenInSelectMode = selectableChildren.every(child => !selectedNodes.includes(child.id));
    const descendantsInSelectMode = selectableDescendants.every(descendant => !selectedNodes.includes(descendant.id));

    const _handleGroupSelection = (nodes: ITreeSelectionNode[], selected: boolean) => (event: MouseEvent) => {
        event.stopPropagation();
        onGroupSelect(nodes, selected);
    };

    return (
        <div className={treeNodeLine}>
            <div className={treeNodeLineSection}>
                {showNodeTypeIcon && node.record && (
                    <FontAwesomeIcon
                        icon={
                            node.libraryBehavior === LibraryBehavior.directories
                                ? faFolder
                                : getFileTypeIcon(node.title as string)
                        }
                        color={node.disabled ? 'var(--general-utilities-text-disabled)' : undefined}
                    />
                )}
                <KitTypography.Text size="fontSize5" disabled={node.disabled}>
                    {node.title}
                </KitTypography.Text>
                <SelectedDescendantsCount node={node} selectedNodes={selectedNodes} />
            </div>
            <div className={treeNodeLineSection}>
                <div className={groupButtons}>
                    {showSelectChildrenButton && selectableChildren.length > 0 && (
                        <KitTooltip
                            title={t(
                                `tree-node-selection.${childrenInSelectMode ? 'select_children' : 'unselect_children'}`,
                            )}
                        >
                            <KitButton
                                size="s"
                                icon={<FontAwesomeIcon icon={faListCheck} />}
                                onClick={_handleGroupSelection(selectableChildren, childrenInSelectMode)}
                                aria-label={t(
                                    `tree-node-selection.${childrenInSelectMode ? 'select_children' : 'unselect_children'}`,
                                )}
                            />
                        </KitTooltip>
                    )}
                    {showSelectDescendantsButton && selectableDescendants.length > 0 && (
                        <KitTooltip
                            title={t(
                                `tree-node-selection.${descendantsInSelectMode ? 'select_descendants' : 'unselect_descendants'}`,
                            )}
                        >
                            <KitButton
                                size="s"
                                icon={<FontAwesomeIcon icon={faCheckDouble} />}
                                onClick={_handleGroupSelection(selectableDescendants, descendantsInSelectMode)}
                                aria-label={t(
                                    `tree-node-selection.${descendantsInSelectMode ? 'select_descendants' : 'unselect_descendants'}`,
                                )}
                            />
                        </KitTooltip>
                    )}
                </div>
                {!checkable && isSelected && (
                    <FontAwesomeIcon
                        icon={faCheck}
                        color={
                            node.disabled
                                ? 'var(--general-utilities-text-disabled)'
                                : 'var(--general-utilities-text-blue)'
                        }
                    />
                )}
            </div>
        </div>
    );
};

const SelectedDescendantsCount: FunctionComponent<{node: ITreeSelectionNode; selectedNodes: string[]}> = ({
    node,
    selectedNodes,
}) => {
    const selectedDescendantsCount = _countSelectedDescendants(node, selectedNodes);

    return selectedDescendantsCount > 0 ? (
        <KitTag>
            <KitIdCard description={selectedDescendantsCount} />
        </KitTag>
    ) : null;
};

const _countSelectedDescendants = (node: ITreeSelectionNode, selectedNodes: string[]): number =>
    node.children.reduce(
        (count, child) =>
            count + (selectedNodes.includes(child.id) ? 1 : 0) + _countSelectedDescendants(child, selectedNodes),
        0,
    );
