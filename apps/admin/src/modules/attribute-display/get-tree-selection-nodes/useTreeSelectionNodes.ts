import {useQuery} from '@apollo/client';
import {type TreeSelectProps} from 'antd';
import {useMemo} from 'react';
import {
    type ITreeSelectionNode,
    type ITreeSelectionNodesQueryData,
    type ITreeSelectionNodesQueryVariables,
    treeSelectionNodesQuery,
} from './treeSelectionNodesQuery';

type TreeSelectNode = NonNullable<TreeSelectProps['treeData']>[number];

const _mapNodesToTreeData = (nodes: ITreeSelectionNode[]): TreeSelectNode[] =>
    nodes.map(node => ({
        value: node.id,
        // Nodes without a label fall back to their record id, so they stay selectable and searchable
        title: node.record.whoAmI.label ?? node.record.id,
        children: node.children?.length ? _mapNodesToTreeData(node.children) : undefined,
    }));

export const useTreeSelectionNodes = (treeId?: string | null) => {
    // The document is rebuilt on each call: memoize it, or Apollo sees a new query on every render
    const query = useMemo(() => treeSelectionNodesQuery(), []);

    const {data, loading, error} = useQuery<ITreeSelectionNodesQueryData, ITreeSelectionNodesQueryVariables>(query, {
        variables: {treeId: treeId ?? ''},
        skip: !treeId,
    });

    return {
        treeData: data?.treeContent ? _mapNodesToTreeData(data.treeContent) : [],
        loading,
        error,
    };
};
