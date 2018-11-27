import {ApolloClient} from 'apollo-boost';
import * as React from 'react';
import {ApolloConsumer} from 'react-apollo';
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
import {getTreeContentQuery} from 'src/queries/trees/treeContentQuery';
import {deleteTreeElementQuery} from 'src/queries/trees/treeDeleteElementMutation';
import {moveTreeElementQuery} from 'src/queries/trees/treeMoveElementMutation';
import {DELETE_TREE_ELEMENT, DELETE_TREE_ELEMENTVariables} from 'src/_gqlTypes/DELETE_TREE_ELEMENT';
import {TreeElementInput} from 'src/_gqlTypes/globalTypes';
import {MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables} from 'src/_gqlTypes/MOVE_TREE_ELEMENT';
import {TREE_CONTENT, TREE_CONTENTVariables, TREE_CONTENT_treeContent} from 'src/_gqlTypes/TREE_CONTENT';
import TreeStructureView from '../TreeStructureView';

interface ITreeStructureProps {
    treeId: string;
}

interface ITreeStructureState {
    treeData: TreeItem[];
    loaded: boolean;
}

class TreeStructure extends React.Component<ITreeStructureProps, ITreeStructureState> {
    constructor(props) {
        super(props);

        this.state = {
            treeData: [],
            loaded: false
        };
    }

    public render(): JSX.Element {
        const {treeId} = this.props;
        const {treeData, loaded} = this.state;
        return (
            <ApolloConsumer>
                {client => {
                    // Init tree with root children
                    if (!loaded) {
                        this._loadChildren(client, treeId);
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
                            onTreeChange={this._onTreeChange}
                            onVisibilityToggle={onVisibilityToggle}
                            getNodeKey={this._getNodeKey}
                            onMoveNode={onMoveNode}
                            onDeleteNode={onDeleteNode}
                        />
                    );
                }}
            </ApolloConsumer>
        );
    }

    private _convertTreeRecord = (records: TREE_CONTENT_treeContent[]): TreeItem[] => {
        return records.map(
            (r: TREE_CONTENT_treeContent): TreeItem => ({
                ...r.record,
                title: r.record.id,
                subtitle: r.record.library.id,
                children: r.children ? this._convertTreeRecord(r.children as TREE_CONTENT_treeContent[]) : [],
                expanded: false
            })
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
        parent?: TreeElementInput,
        path?: Array<string | number>,
        expand: boolean = true
    ) => {
        let node;

        // Show loading spinner on node
        const withPath = path && typeof path !== 'undefined';
        if (withPath) {
            node = getNodeAtPath({treeData: this.state.treeData, path: path!, getNodeKey: this._getNodeKey});
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
        const nodeToUpdate = getNodeAtPath({treeData: this.state.treeData, path: path!, getNodeKey: this._getNodeKey});
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

        const parentTo: TreeElementInput | null =
            moveData.nextParentNode !== null ? this._nodeToTreeElement(moveData.nextParentNode) : null;

        const variables: MOVE_TREE_ELEMENTVariables = {
            treeId: this.props.treeId,
            element,
            parentTo
        };

        await client.mutate<MOVE_TREE_ELEMENT, MOVE_TREE_ELEMENTVariables>({
            mutation: moveTreeElementQuery,
            variables
        });
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
            getNodeKey: this._getNodeKey
        });
        this.setState({treeData: updatedTree});
    }

    private _mergeNode(nodeData: TreeItem, path: Array<string | number>) {
        return changeNodeAtPath({treeData: this.state.treeData, path, newNode: nodeData, getNodeKey: this._getNodeKey});
    }

    private _getNodeKey(data) {
        return data.node.library.id + '/' + data.node.id;
    }

    private _nodeToTreeElement(node: TreeItem): TreeElementInput {
        return {
            id: node.id,
            library: node.library.id
        };
    }
}

export default TreeStructure;
