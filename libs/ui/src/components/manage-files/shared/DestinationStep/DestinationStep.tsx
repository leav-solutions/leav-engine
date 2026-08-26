import {type FunctionComponent} from 'react';
import {KitTooltip} from 'aristid-ds';
import {SelectTreeNode} from '_ui/components/SelectTreeNode';
import {type ITreeNodeWithRecord} from '_ui/types/trees';
import {destinationFrame} from './DestinationStep.module.css';

const MAX_DISPLAYED_PATH_LENGTH = 30;

interface IDestinationStepProps {
    treeId?: string;
    selectableLibraries: Array<string | undefined>;
    selectedNodeKey?: string;
    onSelect: (node: ITreeNodeWithRecord, selected: boolean) => void;
}

/**
 * First step of both wizards: pick the destination node in the system `files` tree. Files are shown
 * with a type icon and greyed out, since only directories can be selected.
 *
 * `refreshOnMount` because both wizards add nodes to that very tree: served from the cache, a
 * second opening would show the tree as it was before the previous upload or directory creation.
 */
export const DestinationStep: FunctionComponent<IDestinationStepProps> = ({
    treeId,
    selectableLibraries,
    selectedNodeKey,
    onSelect,
}) => (
    <div data-testid="select-tree-node" className={destinationFrame}>
        {treeId && selectableLibraries.every(Boolean) && (
            <SelectTreeNode
                treeId={treeId}
                onSelect={onSelect}
                selectedNodes={selectedNodeKey ? [selectedNodeKey] : []}
                canSelectRootNode
                selectableLibraries={selectableLibraries as string[]}
                showNodeTypeIcon
                refreshOnMount
            />
        )}
    </div>
);

/** Step title showing the selected destination, truncated but readable in full on hover. */
export const DestinationStepTitle: FunctionComponent<{path?: string}> = ({path}) => (
    <KitTooltip title={path}>
        {path && path.length > MAX_DISPLAYED_PATH_LENGTH ? `${path.slice(0, MAX_DISPLAYED_PATH_LENGTH)}...` : path}
    </KitTooltip>
);
