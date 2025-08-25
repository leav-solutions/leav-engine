// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent, useEffect, useState} from 'react';
import {KitTree} from 'aristid-ds';
import {Spin} from 'antd';
import {EventDataNode} from 'antd/lib/tree';
import {ITreeNodeWithRecord} from '_ui/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ChildrenAsRecordValuePermissionFilterInput, useTreeNodeChildrenLazyQuery} from '_ui/_gqlTypes';
import {defaultPaginationPageSize, ErrorDisplay} from '../..';
import {TreeNodeTitle} from './TreeNodeTitle';
import {_isObjectSelection, ITreeMap, ITreeMapElement} from './_types';

interface ISelectTreeNodeContentProps {
    treeData: {id: string; label: string};
    childrenAsRecordValuePermissionFilter?: ChildrenAsRecordValuePermissionFilterInput;
    selectedNodes?: string[];
    disabledNodes?: string[];
    onSelect: (node: ITreeNodeWithRecord, selected: boolean) => void;
    onCheck?: (selection: ITreeNodeWithRecord[]) => void;
    multiple?: boolean;
    checkable?: boolean;
    checkStrictly?: boolean;
    canSelectRoot?: boolean;
    selectableLibraries?: string[]; // all by default
    loadRecursively?: boolean;
}

export const SelectTreeNodeContent: FunctionComponent<ISelectTreeNodeContentProps> = ({
    treeData: tree,
    childrenAsRecordValuePermissionFilter,
    onSelect,
    onCheck,
    selectedNodes,
    disabledNodes,
    multiple = false,
    checkable = false,
    checkStrictly = true,
    canSelectRoot = false,
    selectableLibraries,
    loadRecursively = false
}) => {
    const {t} = useSharedTranslation();

    const rootNode: ITreeMapElement = {
        title: tree.label,
        record: null,
        id: tree.id,
        key: tree.id,
        isLeaf: false,
        parents: [],
        paginationOffset: 0,
        children: []
    };

    // As we'll fetch children when a node is expanded, we store the whole tree content in a hash map
    // to make update easier and more efficient
    const [treeMap, setTreeMap] = useState<ITreeMap>({
        [tree.id]: rootNode
    });

    const [fetchError, setFetchError] = useState<string | undefined>();
    const [loadTreeContent, {error, called}] = useTreeNodeChildrenLazyQuery();

    const _fetchTreeContent = async (
        parentNodeKey?: string,
        offset = 0,
        recursive = false,
        currentTreeMap = {...treeMap}
    ) => {
        try {
            const {
                data: {treeNodeChildren}
            } = await loadTreeContent({
                variables: {
                    treeId: tree.id,
                    node: parentNodeKey && parentNodeKey !== tree.id ? parentNodeKey : null,
                    pagination: {
                        limit: defaultPaginationPageSize,
                        offset
                    },
                    childrenAsRecordValuePermissionFilter
                }
            });

            const parentMapKey = parentNodeKey ?? tree.id;
            const parentElement = currentTreeMap[parentMapKey];

            const parentPath = parentElement?.parents ?? [];

            const formattedNodes = treeNodeChildren.list.map(e => {
                const currentParents = [...parentPath, parentMapKey];

                return {
                    record: e.record,
                    title: e.record.whoAmI.label || e.record.whoAmI.id,
                    id: e.id,
                    key: e.id,
                    isLeaf: !e.childrenCount,
                    children: [],
                    parents: currentParents,
                    paginationOffset: 0,
                    disabled: disabledNodes?.includes(e.id)
                };
            });

            parentElement.children = [
                ...parentElement.children.filter(child => !child.key.startsWith(`__showMore${parentMapKey}`)),
                ...formattedNodes
            ];

            for (const node of formattedNodes) {
                currentTreeMap[node.key] = node as ITreeMapElement;
            }

            const newOffset = offset + defaultPaginationPageSize;
            if (treeNodeChildren.totalCount > newOffset) {
                await _fetchTreeContent(parentNodeKey, newOffset, recursive, currentTreeMap);
            }

            if (recursive) {
                for (const node of formattedNodes) {
                    if (!node.isLeaf) {
                        await _fetchTreeContent(node.key, 0, true, currentTreeMap);
                    }
                }
            }

            setTreeMap(currentTreeMap);
            setFetchError(undefined);
        } catch (err) {
            setFetchError((err as Error).message);
        }
    };

    useEffect(() => {
        _fetchTreeContent(undefined, 0, loadRecursively);
    }, [loadRecursively]);

    const _handleLoadData: ComponentProps<typeof KitTree>['loadData'] = async nodeData => {
        const {id, isShowMore} = nodeData as EventDataNode<ITreeMapElement>;

        // Handle offset if we get here through the "show more" element
        const currentNodeOffset = treeMap[id]?.paginationOffset ?? 0;
        const paginationOffset = isShowMore
            ? (treeMap[id]?.paginationOffset ?? 0) + defaultPaginationPageSize
            : currentNodeOffset;

        if (id === tree.id && !isShowMore) {
            // Root has already been loaded
            return;
        }

        await _fetchTreeContent(id, paginationOffset);
    };

    const _handleSelect: ComponentProps<typeof KitTree>['onSelect'] = (_, e) => {
        const node = treeMap[e.node.key];
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
                []
            );

        if (node) {
            if (checkable) {
                const isDeselecting = selectedNodes.includes(node.id);
                if (isDeselecting) {
                    const nodeToDeselect = [node.id, ...node.parents, ...getAllDescendants(node.id)];
                    const selectionToKeep = selectedNodes.filter(
                        selectedNode => !nodeToDeselect.includes(selectedNode)
                    );
                    _handleCheck(selectionToKeep, null);
                } else {
                    _handleCheck([...selectedNodes, node.id], null);
                }
            } else {
                onSelect(node, e.selected);
            }
        }
    };

    const _handleCheck: ComponentProps<typeof KitTree>['onCheck'] = selection => {
        const checkedKeys = _isObjectSelection(selection) ? selection.checked : selection;
        const nodes = checkedKeys.map(key => treeMap[key]);
        onCheck(nodes);
    };

    if (!called) {
        return <Spin />;
    }

    if (error || fetchError) {
        return <ErrorDisplay message={error?.message ?? fetchError} />;
    }

    return (
        <KitTree
            key={selectedNodes?.join('-')}
            checkStrictly={checkStrictly}
            treeData={[treeMap[rootNode.key]]}
            {...(!loadRecursively && {loadData: _handleLoadData})}
            multiple={multiple}
            checkable={checkable}
            defaultExpandedKeys={selectedNodes?.length > 0 && checkable ? selectedNodes : [tree.id]}
            selectedKeys={selectedNodes}
            checkedKeys={selectedNodes}
            titleRender={node => {
                const dataNode = node as ITreeMapElement;

                return (
                    <TreeNodeTitle
                        title={dataNode.title}
                        checkable={checkable}
                        isSelected={selectedNodes?.includes(dataNode.id)}
                        isDisabled={disabledNodes?.includes(dataNode.id)}
                    />
                );
            }}
            onSelect={_handleSelect}
            onCheck={_handleCheck}
        />
    );
};
