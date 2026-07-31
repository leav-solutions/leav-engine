import {Spin} from 'antd';
import {KitTree} from 'aristid-ds';
import {type ComponentProps, type FunctionComponent, type Key} from 'react';
import {
    type ChildrenAsRecordValuePermissionFilterInput,
    type DependentValuesPermissionFilterInput,
} from '_ui/_gqlTypes';
import {
    type IResolvedTreeSelectionConf,
    type ITreeSelectionNode,
    resolveTreeSelectionConf,
    useTreeSelectionNodes,
} from '_ui/hooks/useTreeSelection';
import {type ITreeNodeWithRecord} from '_ui/types';
import {ErrorDisplay} from '../ErrorDisplay';
import {TreeNodeTitleV2} from './TreeNodeTitleV2';

export interface ISelectTreeNodeV2Props extends Partial<IResolvedTreeSelectionConf> {
    treeId: string;
    onSelect: (node: ITreeNodeWithRecord, selected: boolean) => void;
    onCheck?: (selection: ITreeNodeWithRecord[]) => void;
    selectedNodes?: string[];
    disabledNodes?: string[];
    selectableLibraries?: string[]; // all by default
    multiple?: boolean;
    checkable?: boolean;
    checkStrictly?: boolean;
    childrenAsRecordValuePermissionFilter?: ChildrenAsRecordValuePermissionFilterInput;
    dependentValuesPermissionFilter?: DependentValuesPermissionFilterInput;
}

type OnCheckSelection = Parameters<ComponentProps<typeof KitTree>['onCheck']>[0];

const _isObjectSelection = (selection: OnCheckSelection): selection is Exclude<OnCheckSelection, Key[]> =>
    'checked' in selection && 'halfChecked' in selection;

/**
 * Tree node selection, V2 of `SelectTreeNode`: same `KitTree` rendering, but the data and selection
 * layers are driven by an `IResolvedTreeSelectionConf` instead of hard-coded behaviours.
 *
 * The 6 configuration parameters arrive as optional overrides — callers that read them from an
 * attribute (see `SelectTreeNodeModalV2`) resolve them beforehand and pass them down already merged.
 */
export const SelectTreeNodeV2: FunctionComponent<ISelectTreeNodeV2Props> = ({
    treeId,
    onSelect,
    onCheck,
    selectedNodes = [],
    disabledNodes = [],
    selectableLibraries,
    multiple = false,
    checkable = false,
    checkStrictly = true,
    childrenAsRecordValuePermissionFilter,
    dependentValuesPermissionFilter,
    selectableNodes,
    defaultExpanded,
    displayRootNode,
    maxDepth,
    showSelectChildrenButton,
    showSelectDescendantsButton,
}) => {
    const conf = resolveTreeSelectionConf(null, {
        selectableNodes,
        defaultExpanded,
        displayRootNode,
        maxDepth,
        showSelectChildrenButton,
        showSelectDescendantsButton,
    });

    const {rootNode, nodesById, getDescendants, loading, error} = useTreeSelectionNodes({
        treeId,
        conf,
        disabledNodes,
        childrenAsRecordValuePermissionFilter,
        dependentValuesPermissionFilter,
    });

    const _canSelect = (node: ITreeSelectionNode) =>
        node.selectable && (!selectableLibraries || selectableLibraries.includes(node.record?.whoAmI.library.id));

    const _emitCheck = (checkedKeys: string[]) => {
        onCheck?.(checkedKeys.map(key => nodesById[key]).filter(node => node && _canSelect(node)));
    };

    const _handleSelect: ComponentProps<typeof KitTree>['onSelect'] = (_, event) => {
        // Prevent selecting when clicking on one of the group selection buttons
        if (event.nativeEvent.target instanceof HTMLButtonElement) {
            return;
        }

        const node = nodesById[String(event.node.key)];

        if (!node || !_canSelect(node)) {
            return;
        }

        if (checkable) {
            _emitCheck(
                selectedNodes.includes(node.id)
                    ? selectedNodes.filter(selectedNode => selectedNode !== node.id)
                    : [...selectedNodes, node.id],
            );

            return;
        }

        onSelect(node, event.selected);
    };

    const _handleGroupSelect = (nodes: ITreeSelectionNode[], selected: boolean) => {
        if (checkable) {
            const nodeIds = nodes.map(node => node.id);

            _emitCheck(
                selected
                    ? [...new Set([...selectedNodes, ...nodeIds])]
                    : selectedNodes.filter(selectedNode => !nodeIds.includes(selectedNode)),
            );

            return;
        }

        nodes.forEach(node => onSelect(node, selected));
    };

    // `selectable: false` is not enough in checkable mode, the keys have to be filtered as well
    const _handleCheck: ComponentProps<typeof KitTree>['onCheck'] = selection => {
        const checkedKeys = _isObjectSelection(selection) ? selection.checked : selection;

        _emitCheck(checkedKeys.map(String));
    };

    if (loading) {
        return <Spin />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!rootNode) {
        return null;
    }

    // Ancestors of the already selected nodes, so that current values are visible without unfolding
    const defaultExpandedKeys = [
        rootNode.key,
        ...selectedNodes.flatMap(selectedNode => nodesById[selectedNode]?.parents ?? []),
    ];

    return (
        <KitTree
            treeData={[rootNode]}
            multiple={multiple}
            checkable={checkable}
            checkStrictly={checkStrictly}
            defaultExpandAll={conf.defaultExpanded}
            defaultExpandedKeys={conf.defaultExpanded ? undefined : defaultExpandedKeys}
            selectedKeys={selectedNodes}
            checkedKeys={selectedNodes}
            titleRender={node => (
                <TreeNodeTitleV2
                    node={node as ITreeSelectionNode}
                    nodesById={nodesById}
                    getDescendants={getDescendants}
                    checkable={checkable}
                    selectedNodes={selectedNodes}
                    showSelectChildrenButton={conf.showSelectChildrenButton}
                    showSelectDescendantsButton={conf.showSelectDescendantsButton}
                    onGroupSelect={_handleGroupSelect}
                />
            )}
            onSelect={_handleSelect}
            onCheck={_handleCheck}
        />
    );
};
