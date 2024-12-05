// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Spin} from 'antd';
import {Key} from 'antd/lib/table/interface';
import {EventDataNode} from 'antd/lib/tree';
import {ComponentProps, FunctionComponent, useEffect, useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {TreeNodeChildFragment, useTreeNodeChildrenLazyQuery} from '_ui/_gqlTypes';
import {defaultPaginationPageSize, ErrorDisplay} from '../..';
import useLang from '../../hooks/useLang';
import {SystemTranslation} from '../../types/scalars';
import {ITreeNodeWithRecord} from '../../types/trees';
import {KitTree} from 'aristid-ds';

interface ISelectTreeNodeProps {
    tree: {id: string; label?: SystemTranslation | null};
    selectedNode?: string;
    onSelect: (node: ITreeNodeWithRecord, selected: boolean) => void;
    onCheck?: (selection: ITreeNodeWithRecord[]) => void;
    multiple?: boolean;
    canSelectRoot?: boolean;
    selectableLibraries?: string[]; // all by default
}

const _constructTreeContent = (data: TreeNodeChildFragment[]): ITreeNodeWithRecord[] =>
    data.map(e => ({
        record: e.record,
        title: e.record.whoAmI.label || e.record.whoAmI.id,
        id: e.id,
        key: e.id,
        isLeaf: !e.childrenCount,
        children: []
    }));

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

export const SelectTreeNode: FunctionComponent<ISelectTreeNodeProps> = ({
    tree,
    onSelect,
    onCheck,
    selectedNode: initSelectedNode,
    multiple = false,
    canSelectRoot = false,
    selectableLibraries
}) => {
    const {lang} = useLang();
    const {t} = useSharedTranslation();

    //TODO: component should be autonomous and fetch tree label by itself. Right now, we rely on the caller to get tree data
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
            );

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

    const _handleCheck: ComponentProps<typeof KitTree>['onCheck'] = selection => {
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

    const treeData = [treeMap[rootNode.key]];

    return (
        <KitTree
            defaultExpandedKeys={[tree.id]} // TODO: Should be selectedNode but more changes are needed
            multiple={multiple}
            selectable={true}
            selectedKeys={[selectedNode]}
            onSelect={_handleSelect}
            onCheck={_handleCheck}
            treeData={treeData}
            loadData={_handleLoadData}
            checkStrictly
            checkable={multiple}
            showLine={{
                showLeafIcon: false
            }}
        />
    );
};
