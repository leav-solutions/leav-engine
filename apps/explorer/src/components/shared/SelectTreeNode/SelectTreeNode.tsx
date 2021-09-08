// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {Spin, Tree} from 'antd';
import {getTreeContentQuery, IGetTreeContentQuery, IRecordAndChildren} from 'graphQL/queries/trees/getTreeContentQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useEffect, useState} from 'react';
import {localizedTranslation} from 'utils';
import {ITree} from '_types/types';
import ErrorDisplay from '../ErrorDisplay';
import {ITreeNode} from '../SelectTreeNodeModal/SelectTreeNodeModal';

interface ISelectTreeNodeProps {
    tree: Pick<ITree, 'id' | 'label'>;
    selectedNode?: string;
    onSelect: (node: ITreeNode, selected: boolean) => void;
}

const _constructTreeContent = (data: IRecordAndChildren[], parentPath?: string): ITreeNode[] => {
    return data.map(e => {
        const recordKey = e.record.whoAmI.library.id + '/' + e.record.whoAmI.id;
        const path = [parentPath, recordKey].filter(el => !!el).join('_');

        return {
            title: e.record.whoAmI.label || e.record.whoAmI.id,
            id: recordKey,
            key: path,
            children: !!e.children ? _constructTreeContent(e.children, path) : []
        };
    });
};

const _getTreeNodeByKey = (key: string, treeContent: ITreeNode[]): ITreeNode => {
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

function SelectTreeNode({tree, onSelect, selectedNode: initSelectedNode}: ISelectTreeNodeProps): JSX.Element {
    const [{lang}] = useLang();

    const rootNode: ITreeNode = {
        title: localizedTranslation(tree.label, lang) || tree.id,
        id: tree.id,
        key: tree.id,
        children: []
    };

    // Retrieve tree content
    const {loading, error} = useQuery(getTreeContentQuery(100), {
        variables: {
            treeId: tree.id
        },
        onCompleted: (res: IGetTreeContentQuery) => {
            const formattedData = [{...rootNode, children: _constructTreeContent(res.treeContent)}];

            setTreeContent(formattedData);
            setSelectedNode(initSelectedNode);
        }
    });
    const [selectedNode, setSelectedNode] = useState<string>(initSelectedNode);

    useEffect(() => {
        setSelectedNode(initSelectedNode);
    }, [initSelectedNode]);

    const _handleSelect = (_, e: {selected: boolean; node: any}) => {
        const node = _getTreeNodeByKey(e.node.key, treeContent);
        onSelect(node, e.selected);
    };

    const [treeContent, setTreeContent] = useState<ITreeNode[]>([]);

    if (loading) {
        return <Spin />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    return treeContent.length ? (
        <Tree
            defaultExpandedKeys={[selectedNode]}
            multiple={false}
            selectable={true}
            selectedKeys={[selectedNode]}
            onSelect={_handleSelect}
            treeData={treeContent}
        />
    ) : (
        <></>
    );
}

export default SelectTreeNode;
