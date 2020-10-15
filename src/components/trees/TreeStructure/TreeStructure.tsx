import {ApolloConsumer} from '@apollo/react-common';
import {
    addNodeUnderParent,
    changeNodeAtPath,
    ExtendedNodeData,
    find,
    FullTree,
    getNodeAtPath,
    NodeData,
    OnMovePreviousAndNextLocation,
    removeNodeAtPath,
    TreeItem
} from '@casolutions/react-sortable-tree';
import {ApolloClient} from 'apollo-client';
import {FetchResult} from 'apollo-link';
import React, {useState} from 'react';
import 'react-sortable-tree/style.css';
import styled from 'styled-components';
import {addTreeElementQuery} from '../../../queries/trees/treeAddElementMutation';
import {getTreeContentQuery} from '../../../queries/trees/treeContentQuery';
import {deleteTreeElementQuery} from '../../../queries/trees/treeDeleteElementMutation';
import {moveTreeElementQuery} from '../../../queries/trees/treeMoveElementMutation';
import {getTreeNodeKey} from '../../../utils/utils';
import {ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables} from '../../../_gqlTypes/ADD_TREE_ELEMENT';
import {DELETE_TREE_ELEMENT, DELETE_TREE_ELEMENTVariables} from '../../../_gqlTypes/DELETE_TREE_ELEMENT';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {TreeElementInput} from '../../../_gqlTypes/globalTypes';
import {MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables} from '../../../_gqlTypes/MOVE_TREE_ELEMENT';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import {TREE_CONTENT, TREE_CONTENTVariables, TREE_CONTENT_treeContent} from '../../../_gqlTypes/TREE_CONTENT';
import RecordCard from '../../shared/RecordCard';
import TreeStructureView from '../TreeStructureView';

interface ITreeStructureProps {
    tree: GET_TREES_trees_list;
    readOnly?: boolean;
    onClickNode?: (nodeData: NodeData) => void;
    selection?: NodeData[] | null;
    withFakeRoot?: boolean;
    fakeRootLabel?: string;
    compact?: boolean;
    startAt?: TreeElementInput;
}

const fakeRootId = 'root';

const _convertTreeRecord = (records: TREE_CONTENT_treeContent[], compact: boolean): TreeItem[] => {
    return records.map(
        (r: TREE_CONTENT_treeContent): TreeItem => {
            const nodeTitle =
                r.record.id !== fakeRootId && !compact ? (
                    <RecordCard record={r.record.whoAmI} style={{height: '100%'}} />
                ) : (
                    <RootElem>{r.record.whoAmI.label}</RootElem>
                );

            return {
                ...r.record,
                title: nodeTitle,
                children: r.children ? _convertTreeRecord(r.children as TREE_CONTENT_treeContent[], compact) : [],
                ancestors: r.ancestors ? _convertTreeRecord(r.ancestors as TREE_CONTENT_treeContent[], compact) : [],
                expanded: false
            };
        }
    );
};

const RootElem = styled.div`
    height: 100%;
    padding-left: 1em;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const TreeStructure = ({
    tree,
    readOnly,
    onClickNode,
    selection,
    withFakeRoot,
    fakeRootLabel,
    startAt,
    compact = false
}: ITreeStructureProps) => {
    const fakeRootData = [
        {
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
            children: [],
            ancestors: [],
            order: 0
        }
    ];

    const initTreeData = withFakeRoot ? _convertTreeRecord(fakeRootData, compact) : [];

    const [treeData, setTreeData] = useState<TreeItem[]>(initTreeData);
    const [loaded, setLoaded] = useState<boolean>(false);

    /**
     * Retrieve node children.
     * We retrieve current node children + first level children to know if we must display "expand" button
     *
     * @param client
     * @param parent	No parent = root
     * @param path      No path = root
     * @param expand    Should expand node?
     */
    const _loadChildren = async (
        client: ApolloClient<any>,
        parent?: TreeElementInput | null,
        path?: Array<string | number>,
        expand: boolean = true
    ) => {
        // Show loading spinner on node
        const withPath = !!path;
        if (withPath && parent) {
            const node = getNodeAtPath({treeData, path: path!, getNodeKey: getTreeNodeKey});
            if (node !== null) {
                setTreeData(
                    _mergeNode(
                        {
                            ...node.node,
                            loading: true,
                            loaded: false,
                            expanded: expand
                        },
                        path!
                    )
                );
            }
        }

        // Retrieve data
        const data = await client.query<TREE_CONTENT, TREE_CONTENTVariables>({
            query: getTreeContentQuery,
            variables: {
                treeId: tree.id,
                startAt: parent || null
            }
        });

        const convertedRecords = data.data.treeContent ? _convertTreeRecord(data.data.treeContent, compact) : [];

        // Update tree node with fetched data
        // We must get fresh node data from in case its state has changed during loading (expand/collapse...)
        const nodeToUpdate = getNodeAtPath({treeData, path: path!, getNodeKey: getTreeNodeKey});

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
    };

    /**
     * Save a node move: save its new position and new order of its siblings
     *
     * @param client
     * @param moveData
     */
    const _saveMove = async (
        client: ApolloClient<any>,
        moveData: NodeData & FullTree & OnMovePreviousAndNextLocation
    ) => {
        const element: TreeElementInput = _nodeToTreeElement(moveData.node);

        // Parent node in tree
        const parentNode = moveData.nextParentNode;

        // Parent element to save
        const parentTo: TreeElementInput | null =
            parentNode !== null && parentNode.id !== fakeRootId ? _nodeToTreeElement(parentNode) : null;

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

        // Save element move
        await client.mutate<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>({
            mutation: moveTreeElementQuery,
            variables: {
                treeId: tree.id,
                element,
                parentTo,
                order: position
            }
        });

        // Update positions for all siblings in destination
        const siblings: TreeItem[] = parentNode !== null ? parentNode.children : treeData;
        if (siblings?.length) {
            await Promise.all(
                siblings.map(
                    (s, i): Promise<void | FetchResult<MOVE_TREE_ELEMENT>> => {
                        const siblingElement = _nodeToTreeElement(s);
                        return getTreeNodeKey({node: s}) !== getTreeNodeKey(moveData) // Skip moved element
                            ? client.mutate<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>({
                                  mutation: moveTreeElementQuery,
                                  variables: {
                                      treeId: tree.id,
                                      element: siblingElement,
                                      parentTo,
                                      order: i
                                  }
                              })
                            : Promise.resolve();
                    }
                )
            );
        }
    };

    const _deleteNode = async (client: ApolloClient<any>, node: ExtendedNodeData) => {
        const element: TreeElementInput = _nodeToTreeElement(node.node);

        const variables: DELETE_TREE_ELEMENTVariables = {
            treeId: tree.id,
            element
        };

        await client.mutate<DELETE_TREE_ELEMENT, DELETE_TREE_ELEMENTVariables>({
            mutation: deleteTreeElementQuery,
            variables
        });

        const updatedTree = removeNodeAtPath({
            treeData,
            path: node.path,
            getNodeKey: getTreeNodeKey
        });
        setTreeData(updatedTree);
    };

    const _mergeNode = (nodeData: TreeItem, path: Array<string | number>) => {
        return changeNodeAtPath({treeData, path, newNode: nodeData, getNodeKey: getTreeNodeKey});
    };

    const _nodeToTreeElement = (node: TreeItem): TreeElementInput => {
        return {
            id: node.id,
            library: node.library.id
        };
    };
    const _handleClickNode = treeItem => {
        // Add all parents details on selected node
        const hydratedPath = treeItem.path.map(k => {
            // All we have is the parent key, so we need to find matching node in tree data
            const findRes = find({
                treeData,
                getNodeKey: getTreeNodeKey,
                searchQuery: k,
                searchMethod: d => {
                    const [lib, id] = k.split('/');
                    return d.node.id === id && d.node.library.id === lib;
                }
            });

            return findRes.matches.length ? findRes.matches[0].node : null;
        });

        return onClickNode ? onClickNode({...treeItem, node: {...treeItem.node, parents: hydratedPath}}) : undefined;
    };

    /**
     * Add an element to the tree: send save query and update tree data
     *
     * @param client
     * @param record
     * @param parent
     */
    const _handleAddElement = async (client: ApolloClient<any>, record: RecordIdentity_whoAmI, parent: TreeItem) => {
        const parentToSave =
            parent.id !== fakeRootId
                ? {
                      id: parent.id,
                      library: parent.library.id
                  }
                : null;

        // TODO properly handle errors
        try {
            await client.mutate<ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables>({
                mutation: addTreeElementQuery,
                variables: {
                    treeId: tree.id,
                    element: {
                        id: record.id,
                        library: record.library.id
                    },
                    parent: parentToSave
                }
            });

            const newRecord = {
                record: {
                    id: record.id,
                    library: record.library,
                    whoAmI: record
                },
                children: [],
                ancestors: [],
                order: 0
            };

            const updatedTree = addNodeUnderParent({
                treeData,
                newNode: _convertTreeRecord([newRecord], compact)[0],
                parentKey: getTreeNodeKey({node: parent}),
                getNodeKey: getTreeNodeKey,
                expandParent: true
            });
            setTreeData(updatedTree.treeData);
        } catch (e) {
            console.error(e.message);
        }
    };

    return (
        <ApolloConsumer>
            {client => {
                // Init tree with root children
                if (!loaded) {
                    const path = withFakeRoot ? ['root/root'] : undefined;
                    _loadChildren(client, startAt || null, path);
                }

                const onVisibilityToggle = ({expanded, node, path}) => {
                    if (node.expanded || node.loaded) {
                        return;
                    }

                    return _loadChildren(client, {id: node.id, library: node.library.id}, path, expanded);
                };

                const onMoveNode = moveData => _saveMove(client, moveData);
                const onDeleteNode = nodeData => _deleteNode(client, nodeData);
                const onAddElement = (record: RecordIdentity_whoAmI, parent: TreeItem) =>
                    _handleAddElement(client, record, parent);

                return (
                    <TreeStructureView
                        treeSettings={tree}
                        treeData={treeData}
                        readOnly={readOnly || false}
                        onTreeChange={setTreeData}
                        onVisibilityToggle={onVisibilityToggle}
                        onMoveNode={onMoveNode}
                        onDeleteNode={onDeleteNode}
                        onClickNode={_handleClickNode}
                        selection={selection}
                        onAddElement={onAddElement}
                        compact={compact}
                    />
                );
            }}
        </ApolloConsumer>
    );
};

export default TreeStructure;
