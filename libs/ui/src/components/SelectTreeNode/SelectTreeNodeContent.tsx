// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useEffect, useState} from 'react';
import {KitTree} from 'aristid-ds';
import {Spin} from 'antd';
import {type EventDataNode} from 'antd/lib/tree';
import {type ITreeNodeWithRecord} from '_ui/types';
import {type ChildrenAsRecordValuePermissionFilterInput, useTreeNodeChildrenLazyQuery} from '_ui/_gqlTypes';
import {defaultPaginationPageSize, ErrorDisplay} from '../..';
import {TreeNodeTitle} from './TreeNodeTitle';
import {_isObjectSelection, type ITreeMap, type ITreeMapElement} from './_types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

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
    noPagination?: boolean;
    showSelectChildrenButton?: boolean;
}

export const SelectTreeNodeContent: FunctionComponent<ISelectTreeNodeContentProps> = ({
    treeData: tree,
    childrenAsRecordValuePermissionFilter,
    onSelect,
    onCheck,
    selectedNodes = [],
    disabledNodes = [],
    multiple = false,
    checkable = false,
    checkStrictly = true,
    canSelectRoot = false,
    selectableLibraries,
    loadRecursively = true,
    noPagination = false,
    showSelectChildrenButton = false,
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
        children: [],
    };

    // As we'll fetch children when a node is expanded, we store the whole tree content in a hash map
    // to make update easier and more efficient
    const [treeMap, setTreeMap] = useState<ITreeMap>({
        [tree.id]: rootNode,
    });

    const [fetchError, setFetchError] = useState<string | undefined>();
    const [loadTreeContent, {error, called}] = useTreeNodeChildrenLazyQuery();

    const _fetchTreeContent = async (parentNodeKey?: string, offset = 0, currentTreeMap = {...treeMap}) => {
        try {
            const {
                data: {treeNodeChildren},
            } = await loadTreeContent({
                variables: {
                    treeId: tree.id,
                    node: parentNodeKey && parentNodeKey !== tree.id ? parentNodeKey : null,
                    pagination: noPagination
                        ? undefined
                        : {
                              limit: defaultPaginationPageSize,
                              offset,
                          },
                    childrenAsRecordValuePermissionFilter,
                },
            });

            const parentMapKey = parentNodeKey ?? tree.id;
            const totalCount = treeNodeChildren.totalCount;
            const parentElement = currentTreeMap[parentMapKey];
            const showMoreKey = '__showMore' + parentMapKey + offset;

            const parentPath = parentElement?.parents ?? [];
            const currentParents = [...parentPath, parentMapKey];

            const formattedNodes = treeNodeChildren.list.map(e => ({
                record: e.record,
                title: e.record.whoAmI.label || e.record.whoAmI.id,
                id: e.id,
                key: e.id,
                isLeaf: !e.childrenCount,
                children: [],
                parents: currentParents,
                paginationOffset: 0,
                disabled: disabledNodes.includes(e.id),
            }));

            const existingKeys = new Set(parentElement.children.map(child => child.key));
            const newNodes = formattedNodes.filter(node => !existingKeys.has(node.key));
            parentElement.children = [
                ...parentElement.children.filter(child => !child.key.startsWith(`__showMore${parentMapKey}`)),
                ...newNodes,
            ];

            for (const node of formattedNodes) {
                currentTreeMap[node.key] = node as ITreeMapElement;
                parentElement.paginationOffset = offset;
            }

            if (!noPagination && totalCount > parentElement.paginationOffset + defaultPaginationPageSize) {
                const showMoreElement: ITreeMapElement = {
                    isShowMore: true,
                    record: null,
                    title: t('tree-node-selection.show_more'),
                    id: parentMapKey,
                    key: showMoreKey,
                    isLeaf: false,
                    children: [],
                    paginationOffset: 0,
                };
                parentElement.children.push(showMoreElement);
            }

            const newOffset = offset + defaultPaginationPageSize;
            if (treeNodeChildren.totalCount > newOffset) {
                await _fetchTreeContent(parentNodeKey, newOffset, currentTreeMap);
            }

            if (loadRecursively) {
                for (const node of formattedNodes) {
                    if (!node.isLeaf) {
                        await _fetchTreeContent(node.key, 0, currentTreeMap);
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
        _fetchTreeContent(undefined, 0);
    }, []);

    /**
     * In strict mode, loadData handler is called twice
     * https://github.com/ant-design/ant-design/issues/54497
     */
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
        // Prevent selecting when clicking on select all children button
        if (e.nativeEvent.target instanceof HTMLButtonElement) {
            return;
        }
        // If user clicked on the text "show more", we load more children instead of selecting the node
        if ('isShowMore' in e.node && e.node.isShowMore) {
            _handleLoadData(e.node);
            return;
        }

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
                [],
            );

        if (node) {
            if (checkable) {
                const isDeselecting = selectedNodes.includes(node.id);
                if (isDeselecting) {
                    const nodeToDeselect = [node.id, ...node.parents, ...getAllDescendants(node.id)];
                    const selectionToKeep = selectedNodes.filter(
                        selectedNode => !nodeToDeselect.includes(selectedNode),
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
            checkStrictly={checkStrictly}
            treeData={[treeMap[rootNode.key]]}
            loadData={loadRecursively ? undefined : _handleLoadData}
            multiple={multiple}
            checkable={checkable}
            defaultExpandedKeys={selectedNodes.length > 0 ? [...selectedNodes, tree.id] : [tree.id]}
            selectedKeys={selectedNodes}
            checkedKeys={selectedNodes}
            titleRender={node => (
                <TreeNodeTitle
                    checkable={checkable}
                    disabledNodes={disabledNodes}
                    loadRecursively={loadRecursively}
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
