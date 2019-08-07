import {ApolloConsumer} from '@apollo/react-common';
import {ApolloClient} from 'apollo-client';
import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {
    changeNodeAtPath,
    ExtendedNodeData,
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
    selection?: [NodeData] | null;
    withFakeRoot?: boolean;
}

interface ITreeStructureState {
    treeData: TreeItem[];
    loaded: boolean;
}

/* tslint:disable-next-line:variable-name */
const RootElem = styled.div`
    height: 100%;
    padding-left: 1em;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

class TreeStructure extends React.Component<ITreeStructureProps, ITreeStructureState> {
    constructor(props: ITreeStructureProps) {
        super(props);

        const fakeRootData = [
            {
                record: {
                    id: 'root',
                    library: {id: 'root', label: null},
                    whoAmI: {
                        id: 'root',
                        label: props.t('permissions.any_record'),
                        color: 'transparent',
                        library: {id: 'root', label: null},
                        preview: null
                    }
                },
                children: [],
                order: 0
            }
        ];
        const initTreeData = props.withFakeRoot ? this._convertTreeRecord(fakeRootData) : [];

        this.state = {
            treeData: initTreeData,
            loaded: false
        };
    }

    public render(): JSX.Element {
        const {treeId, readOnly, onClickNode, selection, withFakeRoot} = this.props;
        const {treeData, loaded} = this.state;

        return (
            <ApolloConsumer>
                {client => {
                    // Init tree with root children
                    if (!loaded) {
                        const path = withFakeRoot ? ['root/root'] : undefined;
                        this._loadChildren(client, treeId, null, path);
                    }

                    const onVisibilityToggle = ({expanded, node, path}) => {
                        if (node.expanded || node.loaded) {
                            return;
                        }

                        return this._loadChildren(
                            client,
                            treeId,
                            {id: node.id, library: node.library.id},
                            path,
                            expanded
                        );
                    };

                    const onMoveNode = moveData => this._saveMove(client, moveData);
                    const onDeleteNode = nodeData => this._deleteNode(client, nodeData);

                    return (
                        <TreeStructureView
                            treeData={treeData}
                            readOnly={readOnly || false}
                            onTreeChange={this._onTreeChange}
                            onVisibilityToggle={onVisibilityToggle}
                            onMoveNode={onMoveNode}
                            onDeleteNode={onDeleteNode}
                            onClickNode={onClickNode}
                            selection={selection}
                        />
                    );
                }}
            </ApolloConsumer>
        );
    }

    private _convertTreeRecord = (records: TREE_CONTENT_treeContent[]): TreeItem[] => {
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
                    children: r.children ? this._convertTreeRecord(r.children as TREE_CONTENT_treeContent[]) : [],
                    expanded: false
                };
            }
        );
    }

    private _onTreeChange = treeData => this.setState({treeData});

    /**
     * Retrieve node children.
     * We retrieve current node children + first level children to know if we must display "expand" button
     *
     * @param client
     * @param treeId
     * @param parent	No parent = root
     * @param path      No path = root
     * @param expand    Should expand node?
     */
    private _loadChildren = async (
        client: ApolloClient<any>,
        treeId: string,
        parent?: TreeElementInput | null,
        path?: Array<string | number>,
        expand: boolean = true
    ) => {
        // Show loading spinner on node
        const withPath = !!path;
        if (withPath && parent) {
            const node = getNodeAtPath({treeData: this.state.treeData, path: path!, getNodeKey: getTreeNodeKey});
            if (node !== null) {
                this.setState({
                    treeData: this._mergeNode(
                        {
                            ...node.node,
                            loading: true,
                            loaded: false,
                            expanded: expand
                        },
                        path!
                    )
                });
            }
        }

        // Retrieve data
        const variables: TREE_CONTENTVariables = {
            treeId,
            startAt: parent || null
        };

        const data = await client.query<TREE_CONTENT, TREE_CONTENTVariables>({
            query: getTreeContentQuery,
            variables
        });

        const convertedRecords = data.data.treeContent ? this._convertTreeRecord(data.data.treeContent) : [];

        // Update tree node with fetched data
        // We must get fresh node data from in case its state has changed during loading (expand/collapse...)
        const nodeToUpdate = getNodeAtPath({treeData: this.state.treeData, path: path!, getNodeKey: getTreeNodeKey});
        const newState: Partial<ITreeStructureState> = {
            loaded: true
        };

        if (!withPath) {
            newState.treeData = convertedRecords;
        } else if (nodeToUpdate !== null) {
            newState.treeData = this._mergeNode(
                {
                    ...nodeToUpdate.node,
                    loading: false,
                    loaded: true,
                    children: convertedRecords
                },
                path!
            );
        }

        this.setState(newState as ITreeStructureState);
    }

    private _saveMove = async (
        client: ApolloClient<any>,
        moveData: NodeData & FullTree & OnMovePreviousAndNextLocation
    ) => {
        const element: TreeElementInput = this._nodeToTreeElement(moveData.node);

        // Parent node in tree
        const parentNode = moveData.nextParentNode;

        // Parent element to save
        const parentTo: TreeElementInput | null = parentNode !== null ? this._nodeToTreeElement(parentNode) : null;

        // Get new element position
        let position = moveData.treeIndex;
        if (parentNode !== null) {
            const parentNodeAtPath = getNodeAtPath({
                treeData: this.state.treeData,
                path: moveData.nextPath.slice(0, -1),
                getNodeKey: getTreeNodeKey
            });
            position = parentNodeAtPath ? moveData.treeIndex - parentNodeAtPath.treeIndex - 1 : moveData.treeIndex;
        }

        // Save element move
        await client.mutate<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>({
            mutation: moveTreeElementQuery,
            variables: {
                treeId: this.props.treeId,
                element,
                parentTo,
                order: position
            }
        });

        // Update positions for all siblings in destination
        const siblings = parentNode !== null ? parentNode.children : this.state.treeData;
        if (siblings && siblings.length) {
            await Promise.all(
                siblings.map((s, i) => {
                    const siblingElement = this._nodeToTreeElement(s);
                    return getTreeNodeKey({node: s}) !== getTreeNodeKey(moveData) // Skip moved element
                        ? client.mutate<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>({
                              mutation: moveTreeElementQuery,
                              variables: {
                                  treeId: this.props.treeId,
                                  element: siblingElement,
                                  parentTo,
                                  order: i
                              }
                          })
                        : Promise.resolve();
                })
            );
        }
    }

    private _deleteNode = async (client: ApolloClient<any>, node: ExtendedNodeData) => {
        const element: TreeElementInput = this._nodeToTreeElement(node.node);

        const variables: DELETE_TREE_ELEMENTVariables = {
            treeId: this.props.treeId,
            element
        };

        await client.mutate<DELETE_TREE_ELEMENT, DELETE_TREE_ELEMENTVariables>({
            mutation: deleteTreeElementQuery,
            variables
        });

        const updatedTree = removeNodeAtPath({
            treeData: this.state.treeData,
            path: node.path,
            getNodeKey: getTreeNodeKey
        });
        this.setState({treeData: updatedTree});
    }

    private _mergeNode(nodeData: TreeItem, path: Array<string | number>) {
        return changeNodeAtPath({treeData: this.state.treeData, path, newNode: nodeData, getNodeKey: getTreeNodeKey});
    }

    private _nodeToTreeElement(node: TreeItem): TreeElementInput {
        return {
            id: node.id,
            library: node.library.id
        };
    }
}

export default withNamespaces()(TreeStructure);
