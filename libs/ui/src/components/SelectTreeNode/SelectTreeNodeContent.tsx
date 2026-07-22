import {type ComponentProps, type FunctionComponent, useEffect, useState} from 'react';
import {KitTree} from 'aristid-ds';
import {Spin} from 'antd';
import {type ITreeNodeWithRecord} from '_ui/types';
import {
    type ChildrenAsRecordValuePermissionFilterInput,
    type DependentValuesPermissionFilterInput,
    type TreeContentDataQueryQuery,
} from '_ui/_gqlTypes';
import {ErrorDisplay} from '../../index';
import {TreeNodeTitle} from './TreeNodeTitle';
import {_isObjectSelection, type ITreeMap, type ITreeMapElement} from './_types';
import {useLazyQuery} from '@apollo/client';
import {treeContentDataQuery} from './_queries/treeContentDataQuery';

interface ISelectTreeNodeContentProps {
    treeData: {id: string; label: string};
    childrenAsRecordValuePermissionFilter?: ChildrenAsRecordValuePermissionFilterInput;
    dependentValuesPermissionFilter?: DependentValuesPermissionFilterInput;
    selectedNodes?: string[];
    disabledNodes?: string[];
    onSelect: (node: ITreeNodeWithRecord, selected: boolean) => void;
    onCheck?: (selection: ITreeNodeWithRecord[]) => void;
    multiple?: boolean;
    checkable?: boolean;
    checkStrictly?: boolean;
    canSelectRoot?: boolean;
    selectableLibraries?: string[]; // all by default
    showSelectChildrenButton?: boolean;
}

type TreeContentNode = TreeContentDataQueryQuery['treeContent'][number] & {
    children?: Array<TreeContentDataQueryQuery['treeContent'][number]>;
};

const _toTreeMapElement = (node: TreeContentNode, parents: string[], disabledNodes: string[]): ITreeMapElement => {
    const children = (node.children ?? []).map(child =>
        _toTreeMapElement(child as TreeContentNode, [...parents, node.id], disabledNodes),
    );

    return {
        record: node.record,
        title: node.record.whoAmI.label || node.record.whoAmI.id,
        id: node.id,
        key: node.id,
        isLeaf: !node.childrenCount,
        children,
        parents,
        disabled: disabledNodes.includes(node.id),
    };
};

const _buildTreeMap = (root: ITreeMapElement): ITreeMap => {
    const map: ITreeMap = {};

    const visit = (node: ITreeMapElement) => {
        map[node.id] = node;
        node.children.forEach(visit);
    };

    visit(root);

    return map;
};

export const SelectTreeNodeContent: FunctionComponent<ISelectTreeNodeContentProps> = ({
    treeData: tree,
    childrenAsRecordValuePermissionFilter,
    dependentValuesPermissionFilter,
    onSelect,
    onCheck,
    selectedNodes = [],
    disabledNodes = [],
    multiple = false,
    checkable = false,
    checkStrictly = true,
    canSelectRoot = false,
    selectableLibraries,
    showSelectChildrenButton = false,
}) => {
    const rootNode: ITreeMapElement = {
        title: tree.label,
        record: null,
        id: tree.id,
        key: tree.id,
        isLeaf: false,
        parents: [],
        children: [],
    };

    const [treeMap, setTreeMap] = useState<ITreeMap>({[tree.id]: rootNode});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [loadTreeContent] = useLazyQuery(treeContentDataQuery(), {
        fetchPolicy: dependentValuesPermissionFilter ? 'no-cache' : undefined,
    });

    useEffect(() => {
        const fetchTreeContent = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const {data} = await loadTreeContent({
                    variables: {
                        treeId: tree.id,
                        childrenAsRecordValuePermissionFilter,
                        dependentValuesPermissionFilter,
                    },
                });

                const content = data?.treeContent ?? [];

                const newRoot: ITreeMapElement = {
                    ...rootNode,
                    children: content.map(node => _toTreeMapElement(node as TreeContentNode, [tree.id], disabledNodes)),
                };

                setTreeMap(_buildTreeMap(newRoot));
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to load tree'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchTreeContent();
    }, [tree.id, childrenAsRecordValuePermissionFilter, dependentValuesPermissionFilter]);

    const _handleSelect: ComponentProps<typeof KitTree>['onSelect'] = (_, e) => {
        // Prevent selecting when clicking on select all children button
        if (e.nativeEvent.target instanceof HTMLButtonElement) {
            return;
        }
        const node = treeMap[String(e.node.key)];
        const isRoot = node.id === tree.id;

        if (
            (!canSelectRoot && isRoot) ||
            (!isRoot && selectableLibraries && !selectableLibraries.includes(node.record.whoAmI.library.id))
        ) {
            return;
        }

        const getAllDescendants = (nodeId: string): string[] =>
            treeMap[nodeId].children.reduce<string[]>(
                (acc, child) => [...acc, child.id, ...getAllDescendants(child.id)],
                [],
            );

        if (node) {
            if (checkable) {
                const isDeselecting = selectedNodes.includes(node.id);

                if (isDeselecting && isRoot) {
                    _handleCheck([], null);
                } else if (isDeselecting) {
                    const nodeToDeselect = [node.id, ...node.parents, ...getAllDescendants(node.id)];
                    const selectionToKeep = selectedNodes.filter(
                        selectedNode => !nodeToDeselect.includes(selectedNode),
                    );

                    _handleCheck(selectionToKeep, null);
                } else if (isRoot) {
                    _handleCheck([...getAllDescendants(tree.id), tree.id], null);
                } else {
                    _handleCheck([...selectedNodes, node.id], null);
                }
            } else {
                onSelect(node, e.selected);
            }
        }
    };

    const _handleCheck: ComponentProps<typeof KitTree>['onCheck'] = selection => {
        if (!canSelectRoot && Array.isArray(selection) && selection.includes(tree.id)) {
            return;
        }

        const checkedKeys = _isObjectSelection(selection) ? selection.checked : selection;
        const nodes = checkedKeys.map(key => treeMap[String(key)]);

        onCheck(nodes);
    };

    if (isLoading) {
        return <Spin />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const defaultExpandedKeys =
        selectedNodes.length && !showSelectChildrenButton ? [...selectedNodes, tree.id] : [tree.id];

    return (
        <KitTree
            checkStrictly={checkStrictly}
            treeData={[treeMap[rootNode.key]]}
            multiple={multiple}
            checkable={checkable}
            defaultExpandedKeys={defaultExpandedKeys}
            selectedKeys={selectedNodes}
            checkedKeys={selectedNodes}
            titleRender={node => (
                <TreeNodeTitle
                    checkable={checkable}
                    disabledNodes={disabledNodes}
                    node={node as ITreeMapElement}
                    onSelect={onSelect}
                    selectedNodes={selectedNodes}
                    showSelectChildrenButton={showSelectChildrenButton}
                />
            )}
            onSelect={_handleSelect}
            onCheck={_handleCheck}
        />
    );
};
