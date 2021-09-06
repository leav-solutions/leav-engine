// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useApolloClient} from '@apollo/react-hooks';
import {FetchResult} from 'apollo-link';
import React, {useState} from 'react';
import {
    addNodeUnderParent,
    changeNodeAtPath,
    find,
    FullTree,
    getNodeAtPath,
    NodeData,
    OnMovePreviousAndNextLocation,
    removeNodeAtPath,
    TreeItem
} from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import {Icon, Message} from 'semantic-ui-react';
import styled from 'styled-components';
import {addTreeElementQuery} from '../../../queries/trees/treeAddElementMutation';
import {getTreeContentQuery} from '../../../queries/trees/treeContentQuery';
import {deleteTreeElementQuery} from '../../../queries/trees/treeDeleteElementMutation';
import {moveTreeElementQuery} from '../../../queries/trees/treeMoveElementMutation';
import {getTreeNodeKey} from '../../../utils/utils';
import {ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables} from '../../../_gqlTypes/ADD_TREE_ELEMENT';
import {DELETE_TREE_ELEMENT, DELETE_TREE_ELEMENTVariables} from '../../../_gqlTypes/DELETE_TREE_ELEMENT';
import {GET_TREE_BY_ID_trees_list} from '../../../_gqlTypes/GET_TREE_BY_ID';
import {TreeElementInput} from '../../../_gqlTypes/globalTypes';
import {MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables} from '../../../_gqlTypes/MOVE_TREE_ELEMENT';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import {TREE_CONTENT, TREE_CONTENTVariables, TREE_CONTENT_treeContent} from '../../../_gqlTypes/TREE_CONTENT';
import {ITreeItem} from '../../attributes/EditAttribute/EditAttributeTabs/EmbeddedFieldsTab/EmbeddedFieldsTab';
import RecordCard from '../../shared/RecordCard';
import StructureView from './StructureView';

interface ITreeStructureProps {
    tree: GET_TREE_BY_ID_trees_list;
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
                ancestors: r.ancestors
                    ? r.ancestors.map(a => _convertTreeRecord(a as TREE_CONTENT_treeContent[], compact))
                    : [],
                expanded: false,
                path: []
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
    const apolloClient = useApolloClient();

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
    const [error, setError] = useState<string>();

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
        const data = await apolloClient.query<TREE_CONTENT, TREE_CONTENTVariables>({
            query: getTreeContentQuery,
            variables: {
                treeId: tree.id,
                startAt: parent || null
            }
        });

        const convertedRecords = data.data.treeContent
            ? _convertTreeRecord(data.data.treeContent, compact).map(i => ({...i, path}))
            : [];

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
        setError('');
    };

    /**
     * Save a node move: save its new position and new order of its siblings
     *
     * @param client
     * @param moveData
     */
    const _saveMove = async (moveData: NodeData & FullTree & OnMovePreviousAndNextLocation) => {
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

        try {
            // Save element move
            await apolloClient.mutate<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>({
                mutation: moveTreeElementQuery,
                variables: {
                    treeId: tree.id,
                    element,
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
                            const siblingElement = _nodeToTreeElement(s);
                            return getTreeNodeKey({node: s}) !== getTreeNodeKey(moveData) // Skip moved element
                                ? apolloClient.mutate<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>({
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
            setError('');
        } catch (err) {
            const message = err.graphQLErrors?.[0]?.extensions?.fields?.element ?? err.message;
            setError(message);
        }
    };

    const _deleteNode = async (node: NodeData) => {
        const element: TreeElementInput = _nodeToTreeElement(node.node);

        const variables: DELETE_TREE_ELEMENTVariables = {
            treeId: tree.id,
            element
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
        setTreeData(updatedTree);
        setError('');
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
    const _handleAddElement = async (record: RecordIdentity_whoAmI, parent: TreeItem) => {
        const parentToSave =
            parent.id !== fakeRootId
                ? {
                      id: parent.id,
                      library: parent.library.id
                  }
                : null;

        try {
            await apolloClient.mutate<ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables>({
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
            setError('');
        } catch (err) {
            const message = err.graphQLErrors?.[0]?.extensions?.fields?.element ?? err.message;
            setError(message);
        }
    };

    if (!loaded) {
        const path = withFakeRoot ? ['root/root'] : undefined;
        _loadChildren(startAt || null, path);
    }

    const onVisibilityToggle = ({expanded, node, path}) => {
        if (node.expanded || node.loaded) {
            return;
        }

        return _loadChildren({id: node.id, library: node.library.id}, path, expanded);
    };

    const onAddElement = (record: RecordIdentity_whoAmI, parent: TreeItem) => _handleAddElement(record, parent);

    return (
        <>
            {error && (
                <Message negative>
                    <Message.Header>
                        <Icon name="ban" /> {error}
                    </Message.Header>
                </Message>
            )}
            <StructureView
                treeSettings={tree}
                treeData={treeData}
                readOnly={readOnly || false}
                onTreeChange={setTreeData}
                onVisibilityToggle={onVisibilityToggle}
                onMoveNode={_saveMove}
                onDeleteNode={_deleteNode}
                onClickNode={_handleClickNode}
                selection={selection}
                onAddElement={onAddElement}
                compact={compact}
            />
        </>
    );
};

export default TreeStructure;
