// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {Spin, Tree} from 'antd';
import {Key} from 'antd/lib/table/interface';
import {getTreeContentQuery, IGetTreeContentQuery, IRecordAndChildren} from 'graphQL/queries/trees/getTreeContentQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useEffect, useState} from 'react';
import {localizedTranslation} from 'utils';
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

const _constructTreeContent = (data: IRecordAndChildren[], parentPath?: string): ITreeNodeWithRecord[] => {
    return data.map(e => {
        const recordKey = e.record.whoAmI.library.id + '/' + e.record.whoAmI.id;
        const path = [parentPath, recordKey].filter(el => !!el).join('_');

        return {
            record: e.record,
            title: e.record.whoAmI.label || e.record.whoAmI.id,
            id: recordKey,
            key: path,
            children: !!e.children ? _constructTreeContent(e.children, path) : []
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

function SelectTreeNode({
    tree,
    onSelect,
    onCheck,
    selectedNode: initSelectedNode,
    multiple = false
}: ISelectTreeNodeProps): JSX.Element {
    const [{lang}] = useLang();

    const rootNode: ITreeNodeWithRecord = {
        title: localizedTranslation(tree.label, lang) || tree.id,
        record: null,
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

    const _handleCheck = (selection: {checked: Key[]} | Key[]) => {
        const checkedKeys = typeof selection === 'object' ? (selection as {checked: Key[]}).checked : selection;
        const nodes = checkedKeys.map(key => _getTreeNodeByKey(String(key), treeContent));
        onCheck(nodes);
    };

    const [treeContent, setTreeContent] = useState<ITreeNodeWithRecord[]>([]);

    if (loading) {
        return <Spin />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    return treeContent.length ? (
        <Tree
            defaultExpandedKeys={[selectedNode]}
            multiple={multiple}
            selectable={true}
            selectedKeys={[selectedNode]}
            onSelect={_handleSelect}
            onCheck={_handleCheck}
            treeData={treeContent}
            checkStrictly
            checkable={multiple}
        />
    ) : (
        <></>
    );
}

export default SelectTreeNode;
