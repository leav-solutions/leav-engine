// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {localizedTranslation} from '@leav/utils';
import {Spin, Tree} from 'antd';
import {Key} from 'antd/lib/table/interface';
import {EventDataNode} from 'antd/lib/tree';
import {useEffect, useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {TreeNodeChildrenQuery, useTreeNodeChildrenLazyQuery} from '_ui/_gqlTypes';
import {defaultPaginationPageSize, ErrorDisplay} from '../..';
import useLang from '../../hooks/useLang';
import {SystemTranslation} from '../../types/scalars';
import {ITreeNodeWithRecord} from '../../types/trees';

interface ISelectTreeNodeProps {
    tree: {id: string; label?: SystemTranslation | null};
    selectedNode?: string;
    onSelect: (node: ITreeNodeWithRecord, selected: boolean) => void;
    onCheck?: (selection: ITreeNodeWithRecord[]) => void;
    multiple?: boolean;
    canSelectRoot?: boolean;
    selectableLibraries?: string[]; // all by default
}

const _constructTreeContent = (data: TreeNodeChildrenQuery['treeNodeChildren']['list']): ITreeNodeWithRecord[] =>
    data.map(e => ({
        record: e.record,
        title: e.record.whoAmI.label || e.record.whoAmI.id,
        id: e.id,
        key: e.id,
        isLeaf: !e.childrenCount,
        children: []
    }));

const _getTreeNodeByKey = (key: string, treeContent: ITreeNodeWithRecord[]): ITreeNodeWithRecord => {
    for (const node of treeContent) {
        if (key === node.key) {
            return node;
        }

        const n = _getTreeNodeByKey(key, node.children);

        if (!!n) {
            return n;
        }
    }
};

interface ITreeMapElement extends ITreeNodeWithRecord {
    isLeaf?: boolean;
    paginationOffset: number;
    children: ITreeMapElement[];
    isShowMore?: boolean;
    selectable?: boolean;
}

interface ITreeMap {
    [nodeId: string]: ITreeMapElement;
}

function SelectTreeNode({
    tree,
    onSelect,
    onCheck,
    selectedNode: initSelectedNode,
    multiple = false,
    canSelectRoot = false,
    selectableLibraries
}: ISelectTreeNodeProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useSharedTranslation();

    const rootNode: ITreeMapElement = {
        title: localizedTranslation(tree.label, lang) || tree.id,
        record: null,
        id: tree.id,
        key: tree.id,
        isLeaf: false,
        paginationOffset: 0,
        children: []
    };

    // As we'll fetch children when a node is expanded, we store the whole tree content in a hash map
    // to make update easier and more efficient
    const [treeMap, setTreeMap] = useState<ITreeMap>({
        [tree.id]: rootNode
    });
    const [selectedNode, setSelectedNode] = useState<string>(initSelectedNode);
    const [fetchError, setFetchError] = useState<string>();

    // Retrieve tree content
    const [loadTreeContent, {error, called}] = useTreeNodeChildrenLazyQuery();

    const _fetchTreeContent = async (key?: string, offset = 0) => {
        try {
            const data = await loadTreeContent({
                variables: {
                    treeId: tree.id,
                    node: key && key !== tree.id ? key : null,
                    pagination: {
                        limit: defaultPaginationPageSize,
                        offset
                    }
                }
            });

            const formattedNodes = _constructTreeContent(data.data.treeNodeChildren.list);
            const parentMapKey = key ?? tree.id;

            const newTreeMap = {...treeMap};
            const totalCount = data.data.treeNodeChildren.totalCount;
            const parentElement = newTreeMap[parentMapKey];
            const showMoreKey = '__showMore' + parentMapKey + offset;

            parentElement.children = parentElement.children.filter(
                child => !child.key.match(`__showMore${parentMapKey}`)
            ) as ITreeMapElement[];

            for (const node of formattedNodes) {
                const nodeForTreeMap = {...node, paginationOffset: 0};
                newTreeMap[nodeForTreeMap.key] = nodeForTreeMap as ITreeMapElement;
                parentElement.paginationOffset = offset;
                parentElement.children.push(nodeForTreeMap as ITreeMapElement);
            }

            if (totalCount > parentElement.paginationOffset + defaultPaginationPageSize) {
                const showMoreElement: ITreeMapElement = {
                    id: parentMapKey,
                    key: showMoreKey,
                    record: null,
                    title: t('tree-node-selection.show_more'),
                    isLeaf: false,
                    paginationOffset: 0,
                    isShowMore: true,
                    selectable: false,
                    children: []
                };

                parentElement.children.push(showMoreElement);
            }
            setTreeMap(newTreeMap);

            setFetchError(null);
        } catch (err) {
            setFetchError((err as Error).message);
        }
    };

    useEffect(() => {
        setSelectedNode(initSelectedNode);
    }, [initSelectedNode]);

    useEffect(() => {
        // Load root
        _fetchTreeContent();
    }, []);

    const _handleLoadData = async (nodeData: EventDataNode<ITreeMapElement>) => {
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

        await _fetchTreeContent(String(id), paginationOffset);
    };

    const _handleSelect = (_, e: {selected: boolean; node: any}) => {
        const node = treeMap[e.node.key];
        const isRoot = node.id === tree.id;

        if (
            (!canSelectRoot && isRoot) ||
            (!isRoot &&
                typeof selectableLibraries !== 'undefined' &&
                selectableLibraries.indexOf(node.record.whoAmI.library.id) === -1)
        ) {
            return;
        }

        if (node) {
            onSelect(node, e.selected);
        }
    };

    const _handleCheck = (selection: {checked: Key[]} | Key[]) => {
        const checkedKeys = typeof selection === 'object' ? (selection as {checked: Key[]}).checked : selection;
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
        <Tree
            defaultExpandedKeys={[tree.id]} // TODO: Should be selectedNode but more changes are needed
            multiple={multiple}
            selectable={true}
            selectedKeys={[selectedNode]}
            onSelect={_handleSelect}
            onCheck={_handleCheck}
            treeData={[treeMap[rootNode.key]]}
            loadData={_handleLoadData}
            checkStrictly
            checkable={multiple}
            showLine={{
                showLeafIcon: false
            }}
            switcherIcon={<DownOutlined aria-label="toggle-children" />}
        />
    );
}

export default SelectTreeNode;
