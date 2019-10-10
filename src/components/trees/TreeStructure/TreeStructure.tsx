import {ApolloConsumer} from '@apollo/react-common';
import {ApolloClient} from 'apollo-client';
import React, {useState} from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {
    changeNodeAtPath,
    ExtendedNodeData,
    find,
    FullTree,
    getNodeAtPath,
    NodeData,
    OnMovePreviousAndNextLocation,
    removeNodeAtPath,
    TreeItem
} from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import styled from 'styled-components';
import {getTreeContentQuery} from '../../../queries/trees/treeContentQuery';
import {deleteTreeElementQuery} from '../../../queries/trees/treeDeleteElementMutation';
import {moveTreeElementQuery} from '../../../queries/trees/treeMoveElementMutation';
import {getTreeNodeKey} from '../../../utils/utils';
import {DELETE_TREE_ELEMENT, DELETE_TREE_ELEMENTVariables} from '../../../_gqlTypes/DELETE_TREE_ELEMENT';
import {TreeElementInput} from '../../../_gqlTypes/globalTypes';
import {MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables} from '../../../_gqlTypes/MOVE_TREE_ELEMENT';
import {TREE_CONTENT, TREE_CONTENTVariables, TREE_CONTENT_treeContent} from '../../../_gqlTypes/TREE_CONTENT';
import RecordCard from '../../shared/RecordCard';
import TreeStructureView from '../TreeStructureView';

interface ITreeStructureProps extends WithNamespaces {
    treeId: string;
    readOnly?: boolean;
    onClickNode?: (nodeData: NodeData) => void;
    selection?: NodeData[] | null;
    withFakeRoot?: boolean;
}

const _convertTreeRecord = (records: TREE_CONTENT_treeContent[]): TreeItem[] => {
    return records.map(
        (r: TREE_CONTENT_treeContent): TreeItem => {
            const nodeTitle =
                r.record.id !== 'root' ? (
                    <RecordCard record={r.record.whoAmI} style={{height: '100%'}} />
                ) : (
                    <RootElem>{r.record.whoAmI.label}</RootElem>
                );

            return {
                ...r.record,
                title: nodeTitle,
                // subtitle: r.record.library.id,
                children: r.children ? _convertTreeRecord(r.children as TREE_CONTENT_treeContent[]) : [],
                expanded: false
            };
        }
    );
};

/* tslint:disable-next-line:variable-name */
const RootElem = styled.div`
    height: 100%;
    padding-left: 1em;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

function TreeStructure({treeId, readOnly, onClickNode, selection, withFakeRoot, t}: ITreeStructureProps) {
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
                treeId,
                startAt: parent || null
            }
        });

        const convertedRecords = data.data.treeContent ? _convertTreeRecord(data.data.treeContent) : [];

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

    const _saveMove = async (
        client: ApolloClient<any>,
        moveData: NodeData & FullTree & OnMovePreviousAndNextLocation
    ) => {
        const element: TreeElementInput = _nodeToTreeElement(moveData.node);

        // Parent node in tree
        const parentNode = moveData.nextParentNode;

        // Parent element to save
        const parentTo: TreeElementInput | null = parentNode !== null ? _nodeToTreeElement(parentNode) : null;

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
                treeId,
                element,
                parentTo,
                order: position
            }
        });

        // Update positions for all siblings in destination
        const siblings = parentNode !== null ? parentNode.children : treeData;
        if (siblings && siblings.length) {
            await Promise.all(
                siblings.map((s, i) => {
                    const siblingElement = _nodeToTreeElement(s);
                    return getTreeNodeKey({node: s}) !== getTreeNodeKey(moveData) // Skip moved element
                        ? client.mutate<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>({
                              mutation: moveTreeElementQuery,
                              variables: {
                                  treeId,
                                  element: siblingElement,
                                  parentTo,
                                  order: i
                              }
                          })
                        : Promise.resolve();
                })
            );
        }
    };

    const _deleteNode = async (client: ApolloClient<any>, node: ExtendedNodeData) => {
        const element: TreeElementInput = _nodeToTreeElement(node.node);

        const variables: DELETE_TREE_ELEMENTVariables = {
            treeId,
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

    const fakeRootData = [
        {
            record: {
                id: 'root',
                library: {id: 'root', label: null},
                whoAmI: {
                    id: 'root',
                    label: t('permissions.any_record'),
                    color: 'transparent',
                    library: {id: 'root', label: null},
                    preview: null
                }
            },
            children: [],
            order: 0
        }
    ];

    const initTreeData = withFakeRoot ? _convertTreeRecord(fakeRootData) : [];

    const [treeData, setTreeData] = useState<TreeItem[]>(initTreeData);
    const [loaded, setLoaded] = useState<boolean>(false);

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

    return (
        <ApolloConsumer>
            {client => {
                // Init tree with root children
                if (!loaded) {
                    const path = withFakeRoot ? ['root/root'] : undefined;
                    _loadChildren(client, null, path);
                }

                const onVisibilityToggle = ({expanded, node, path}) => {
                    if (node.expanded || node.loaded) {
                        return;
                    }

                    return _loadChildren(client, {id: node.id, library: node.library.id}, path, expanded);
                };

                const onMoveNode = moveData => _saveMove(client, moveData);
                const onDeleteNode = nodeData => _deleteNode(client, nodeData);

                return (
                    <TreeStructureView
                        treeData={treeData}
                        readOnly={readOnly || false}
                        onTreeChange={setTreeData}
                        onVisibilityToggle={onVisibilityToggle}
                        onMoveNode={onMoveNode}
                        onDeleteNode={onDeleteNode}
                        onClickNode={_handleClickNode}
                        selection={selection}
                    />
                );
            }}
        </ApolloConsumer>
    );
}

export default withNamespaces()(TreeStructure);
