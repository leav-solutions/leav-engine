// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useApolloClient} from '@apollo/client';
import {FetchResult} from 'apollo-link';
import {ITreeItem} from 'components/attributes/EditAttribute/EditAttributeTabs/EmbeddedFieldsTab/EmbeddedFieldsTab';
import {getTreeNodeChildrenQuery} from 'queries/trees/treeNodeChildrenQuery';
import React, {useState} from 'react';
import {addNodeUnderParent, changeNodeAtPath, find, getNodeAtPath, removeNodeAtPath} from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import {Icon, Message} from 'semantic-ui-react';
import styled from 'styled-components';
import {
    TREE_NODE_CHILDREN,
    TREE_NODE_CHILDRENVariables,
    TREE_NODE_CHILDREN_treeNodeChildren_list
} from '_gqlTypes/TREE_NODE_CHILDREN';
import {fakeRootId, ITreeNode, ITreeNodeData} from '_types/trees';
import {WithOptional} from '_types/WithOptional';
import {addTreeElementQuery} from '../../../queries/trees/treeAddElementMutation';
import {deleteTreeElementQuery} from '../../../queries/trees/treeDeleteElementMutation';
import {moveTreeElementQuery} from '../../../queries/trees/treeMoveElementMutation';
import {getTreeNodeKey} from '../../../utils/utils';
import {ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables} from '../../../_gqlTypes/ADD_TREE_ELEMENT';
import {DELETE_TREE_ELEMENT, DELETE_TREE_ELEMENTVariables} from '../../../_gqlTypes/DELETE_TREE_ELEMENT';
import {GET_TREE_BY_ID_trees_list} from '../../../_gqlTypes/GET_TREE_BY_ID';
import {MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables} from '../../../_gqlTypes/MOVE_TREE_ELEMENT';
import RecordCard from '../../shared/RecordCard';
import TreeExplorerView from './TreeExplorerView';
import {
    AddTreeElementHandler,
    ClickNodeHandler,
    DeleteNodeHandler,
    MoveNodeHandler,
    NodeVisibilityToggleHandler
} from './_types';

interface ITreeExplorerProps {
    tree: GET_TREE_BY_ID_trees_list;
    readOnly?: boolean;
    onClickNode?: (nodeData: ITreeNodeData) => void;
    selection?: ITreeNodeData[] | null;
    withFakeRoot?: boolean;
    fakeRootLabel?: string;
    compact?: boolean;
    startAt?: string;
}

type ConvertTreeRecordNode = WithOptional<TREE_NODE_CHILDREN_treeNodeChildren_list, 'order'>;
const _convertTreeRecord = (nodes: ConvertTreeRecordNode[], compact: boolean): ITreeItem[] => {
    return nodes.map(
        (n: ConvertTreeRecordNode): ITreeItem => {
            const nodeTitle =
                n.id !== fakeRootId && !compact ? (
                    <RecordCard record={n.record.whoAmI} style={{height: '100%'}} />
                ) : (
                    <RootElem>{n.record.whoAmI.label ?? n.record.whoAmI.id}</RootElem>
                );

            return {
                ...n,
                title: nodeTitle,
                expanded: false,
                // Actual children loading will be handle by the _loadChildren function.
                // Assigning an empty function here just displays the "+" button if we have children
                children: n.childrenCount ? () => null : null,
                path: []
            };
        }
    );
};

const RootElem = styled.div`
    height: 100%;
    padding-left: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const TreeExplorer = ({
    tree,
    readOnly,
    onClickNode,
    selection,
    withFakeRoot,
    fakeRootLabel,
    startAt,
    compact = false
}: ITreeExplorerProps) => {
    const apolloClient = useApolloClient();

    const fakeRootData = [
        {
            id: fakeRootId,
            record: {
                id: fakeRootId,
                library: {id: fakeRootId, label: null},
                whoAmI: {
                    id: fakeRootId,
                    label: fakeRootLabel || '',
                    color: 'transparent',
                    library: {id: fakeRootId, label: null},
                    preview: null
                },
                isFakeRoot: true
            },
            childrenCount: 0,
            order: 0
        }
    ];

    const initTreeData = withFakeRoot ? _convertTreeRecord(fakeRootData, compact) : [];

    const [treeData, setTreeData] = useState<ITreeNode[]>(initTreeData);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<string>();

    /**
     * Retrieve node children.
     * We retrieve current node children + first level children to know if we must display "expand" button
     *
     * @param parent	No parent = root
     * @param path      No path = root
     * @param expand    Should expand node?
     */
    const _loadChildren = async (parent?: string | null, path?: Array<string | number>, expand: boolean = true) => {
        const withPath = !!path;

        // Retrieve data
        const data = await apolloClient.query<TREE_NODE_CHILDREN, TREE_NODE_CHILDRENVariables>({
            query: getTreeNodeChildrenQuery,
            variables: {
                treeId: tree.id,
                node: parent || null
            }
        });

        const convertedRecords = data.data.treeNodeChildren
            ? _convertTreeRecord(data.data.treeNodeChildren.list, compact).map(i => ({...i, path}))
            : [];

        // Update tree node with fetched data
        // We must get fresh node data from in case its state has changed during loading (expand/collapse...)
        const nodeToUpdate = getNodeAtPath({treeData, path: path!, getNodeKey: getTreeNodeKey}) as ITreeNodeData;

        let newTreeData;
        if (!withPath) {
            newTreeData = convertedRecords;
        } else if (nodeToUpdate !== null) {
            newTreeData = _mergeNode(
                {
                    ...nodeToUpdate.node,
                    loading: false,
                    loaded: true,
                    children: convertedRecords,
                    expanded: expand
                },
                path!
            );
        }

        setLoaded(true);
        setTreeData(newTreeData);
        setError('');
    };

    /**
     * Save a node move: save its new position and new order of its siblings
     *
     * @param client
     * @param moveData
     */
    const _saveMove: MoveNodeHandler = async moveData => {
        // Parent node in tree
        const parentNode = moveData.nextParentNode as ITreeNode;

        // Parent element to save
        const parentTo = parentNode !== null && parentNode.id !== fakeRootId ? parentNode.id : null;

        // Get new element position
        let position = moveData.treeIndex;
        if (parentNode !== null) {
            const parentNodeAtPath = getNodeAtPath({
                treeData,
                path: moveData.nextPath.slice(0, -1),
                getNodeKey: getTreeNodeKey
            });
            position = parentNodeAtPath ? moveData.treeIndex - parentNodeAtPath.treeIndex - 1 : moveData.treeIndex;
        }

        try {
            // Save element move
            await apolloClient.mutate<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>({
                mutation: moveTreeElementQuery,
                variables: {
                    treeId: tree.id,
                    nodeId: moveData.node.id,
                    parentTo,
                    order: position
                }
            });

            // Update positions (field 'order') for all siblings in destination
            const siblings = parentNode !== null ? parentNode.children : treeData;
            if (siblings?.length) {
                await Promise.all(
                    (siblings as ITreeItem[]).map(
                        (s, i): Promise<void | FetchResult<MOVE_TREE_ELEMENT>> => {
                            return getTreeNodeKey({node: s}) !== getTreeNodeKey(moveData) // Skip moved element
                                ? apolloClient.mutate<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>({
                                      mutation: moveTreeElementQuery,
                                      variables: {
                                          treeId: tree.id,
                                          nodeId: s.id,
                                          parentTo,
                                          order: i
                                      }
                                  })
                                : Promise.resolve();
                        }
                    )
                );
            }
            setError('');
        } catch (err) {
            const message = err.graphQLErrors?.[0]?.extensions?.fields?.element ?? err.message;
            setError(message);
        }
    };

    const _deleteNode: DeleteNodeHandler = async node => {
        const variables: DELETE_TREE_ELEMENTVariables = {
            treeId: tree.id,
            nodeId: node.node.id
        };

        await apolloClient.mutate<DELETE_TREE_ELEMENT, DELETE_TREE_ELEMENTVariables>({
            mutation: deleteTreeElementQuery,
            variables
        });

        const updatedTree = removeNodeAtPath({
            treeData,
            path: node.path,
            getNodeKey: getTreeNodeKey
        });
        setTreeData(updatedTree as ITreeNode[]);
        setError('');
    };

    const _mergeNode = (nodeData: ITreeNode, path: Array<string | number>): ITreeNode[] => {
        return changeNodeAtPath({treeData, path, newNode: nodeData, getNodeKey: getTreeNodeKey}) as ITreeNode[];
    };

    const _handleClickNode: ClickNodeHandler = nodeData => {
        // Add all parents details on selected node
        const hydratedPath = nodeData.path.map(nodeKey => {
            // All we have is the parent key, so we need to find matching node in tree data
            const findRes = find({
                treeData,
                getNodeKey: getTreeNodeKey,
                searchQuery: nodeKey,
                searchMethod: d => {
                    return d.node.id === nodeKey;
                }
            });

            return findRes.matches.length ? findRes.matches[0].node : null;
        });

        return onClickNode ? onClickNode({...nodeData, node: {...nodeData.node, parents: hydratedPath}}) : undefined;
    };

    /**
     * Add an element to the tree: send save query and update tree data
     *
     * @param client
     * @param record
     * @param parent
     */
    const _handleAddElement: AddTreeElementHandler = async (record, parent, path) => {
        try {
            const addResult = await apolloClient.mutate<ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables>({
                mutation: addTreeElementQuery,
                variables: {
                    treeId: tree.id,
                    element: {
                        id: record.id,
                        library: record.library.id
                    },
                    parent: parent !== fakeRootId ? parent : null
                }
            });

            const newRecord = {
                id: addResult.data.treeAddElement.id,
                record: {
                    id: record.id,
                    library: record.library,
                    whoAmI: record
                },
                childrenCount: 0,
                order: 0
            };

            const parentKey = getTreeNodeKey({node: {id: parent, path}});
            const updatedTree = addNodeUnderParent({
                treeData,
                newNode: _convertTreeRecord([newRecord], compact)[0],
                parentKey,
                getNodeKey: getTreeNodeKey,
                expandParent: true
            });
            setTreeData(updatedTree.treeData as ITreeNode[]);
            setError('');
        } catch (err) {
            const message = err.graphQLErrors?.[0]?.extensions?.fields?.element ?? err.message;
            setError(message);
        }
    };

    if (!loaded) {
        const path = withFakeRoot ? [fakeRootId] : undefined;
        _loadChildren(startAt || null, path);
    }

    const onVisibilityToggle: NodeVisibilityToggleHandler = ({expanded, node, path}) => {
        if (node.expanded || node.loaded) {
            return;
        }

        return _loadChildren(node.id, path, expanded);
    };

    return (
        <>
            {error && (
                <Message negative>
                    <Message.Header>
                        <Icon name="ban" /> {error}
                    </Message.Header>
                </Message>
            )}
            <TreeExplorerView
                treeSettings={tree}
                treeData={treeData}
                readOnly={readOnly || false}
                onTreeChange={setTreeData}
                onVisibilityToggle={onVisibilityToggle}
                onMoveNode={_saveMove}
                onDeleteNode={_deleteNode}
                onClickNode={_handleClickNode}
                selection={selection}
                onAddElement={_handleAddElement}
                compact={compact}
            />
        </>
    );
};

export default TreeExplorer;
