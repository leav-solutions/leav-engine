// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Spin, Tree} from 'antd';
import {Key} from 'antd/lib/table/interface';
import {EventDataNode} from 'antd/lib/tree';
import {treeContentQuery} from 'graphQL/queries/trees/getTreeContentQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useEffect, useState} from 'react';
import {localizedTranslation} from 'utils';
import {GET_TREE_CONTENT, GET_TREE_CONTENTVariables, GET_TREE_CONTENT_treeContent} from '_gqlTypes/GET_TREE_CONTENT';
import {ISystemTranslation} from '_types/types';
import ErrorDisplay from '../ErrorDisplay';
import {ITreeNodeWithRecord} from '../SelectTreeNodeModal/SelectTreeNodeModal';

interface ISelectTreeNodeProps {
    tree: {id: string; label?: ISystemTranslation | null};
    selectedNode?: string;
    onSelect: (node: ITreeNodeWithRecord, selected: boolean) => void;
    onCheck?: (selection: ITreeNodeWithRecord[]) => void;
    multiple?: boolean;
}

const _constructTreeContent = (data: GET_TREE_CONTENT_treeContent[]): ITreeNodeWithRecord[] => {
    return data.map(e => {
        return {
            record: e.record,
            title: e.record.whoAmI.label || e.record.whoAmI.id,
            id: e.id,
            key: e.id,
            isLeaf: !e.childrenCount,
            children: []
        };
    });
};

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

interface ITreeMap {
    [nodeId: string]: ITreeNodeWithRecord;
}

function SelectTreeNode({
    tree,
    onSelect,
    onCheck,
    selectedNode: initSelectedNode,
    multiple = false
}: ISelectTreeNodeProps): JSX.Element {
    const [{lang}] = useLang();

    const rootNode: ITreeNodeWithRecord & {isLeaf?: boolean} = {
        title: localizedTranslation(tree.label, lang) || tree.id,
        record: null,
        id: tree.id,
        key: tree.id,
        isLeaf: false,
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
    const [loadTreeContent, {error, called}] = useLazyQuery<GET_TREE_CONTENT, GET_TREE_CONTENTVariables>(
        treeContentQuery
    );

    const _fetchTreeContent = async (key?: string) => {
        try {
            const data = await loadTreeContent({
                variables: {
                    treeId: tree.id,
                    startAt: key ?? null
                }
            });

            const formattedNodes = _constructTreeContent(data.data.treeContent);
            const parentMapKey = key ?? tree.id;
            const newTreeMap = {...treeMap};

            for (const node of formattedNodes) {
                newTreeMap[node.key] = node;
                newTreeMap[parentMapKey].children.push(node);
            }

            setTreeMap(newTreeMap);

            setFetchError(null);
        } catch (err) {
            setFetchError(err.message);
        }
    };

    useEffect(() => {
        setSelectedNode(initSelectedNode);
    }, [initSelectedNode]);

    useEffect(() => {
        // Load root
        _fetchTreeContent();
    }, []);

    const _handleLoadData = async (nodeData: EventDataNode) => {
        const {key} = nodeData;

        if (key === tree.id) {
            // Root has already been loaded
            return;
        }

        await _fetchTreeContent(String(key));
    };

    const _handleSelect = (_, e: {selected: boolean; node: any}) => {
        const node = treeMap[e.node.key];

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
            defaultExpandedKeys={[selectedNode]}
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
