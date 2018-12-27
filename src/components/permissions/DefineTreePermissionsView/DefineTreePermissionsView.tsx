import * as React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {NodeData, TreeNode} from 'react-sortable-tree';
import {getTreeNodeKey} from 'src/utils/utils';
import {GET_LIBRARIES_libraries_permissionsConf_permissionTreeAttributes} from 'src/_gqlTypes/GET_LIBRARIES';
import {PermissionsActions, PermissionTypes} from 'src/_gqlTypes/globalTypes';
import DefinePermissionsViewLoadTree from '../DefinePermissionsViewLoadTree';
import EditPermissions from '../EditPermissions';

interface IDefineTreePermissionsViewProps extends WithNamespaces {
    onSavePermissions: (permData: any) => void;
    treeAttribute: GET_LIBRARIES_libraries_permissionsConf_permissionTreeAttributes;
    permissionType: PermissionTypes;
    applyTo: string;
}

function DefineTreePermissionsView({
    treeAttribute: tree,
    onSavePermissions,
    permissionType,
    applyTo
}: IDefineTreePermissionsViewProps): JSX.Element {
    const usersGroupsTreeId = 'users_groups';
    const [selectedTreeNode, setSelectedTreeNode] = React.useState<NodeData | null>(null);
    const [selectedGroupNode, setSelectedGroupNode] = React.useState<NodeData | null>(null);
    const _selectTreeNode = (nodeData: NodeData) =>
        setSelectedTreeNode(
            getTreeNodeKey(nodeData) !== getTreeNodeKey(selectedTreeNode as TreeNode) ? nodeData : null
        );

    const _selectGroupNode = (nodeData: NodeData) =>
        setSelectedGroupNode(
            getTreeNodeKey(nodeData) !== getTreeNodeKey(selectedGroupNode as TreeNode) ? nodeData : null
        );

    const wrapperStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: '100%'
    };

    const childStyle: React.CSSProperties = {
        position: 'relative',
        paddingLeft: '1em',
        width: '33%',
        flexDirection: 'column',
        display: 'flex',
        textAlign: 'center'
    };

    const withBorder: React.CSSProperties = {
        borderRight: '1px solid #999999'
    };

    return tree.linked_tree ? (
        <div style={wrapperStyle}>
            <div style={{...childStyle, ...withBorder}}>
                <DefinePermissionsViewLoadTree
                    treeId={tree.linked_tree}
                    onClick={_selectTreeNode}
                    selectedNode={selectedTreeNode}
                />
            </div>
            {selectedTreeNode && (
                <div style={{...childStyle, ...withBorder}}>
                    <DefinePermissionsViewLoadTree
                        treeId={usersGroupsTreeId}
                        onClick={_selectGroupNode}
                        selectedNode={selectedGroupNode}
                    />
                </div>
            )}
            {selectedTreeNode && selectedGroupNode && (
                <div style={childStyle}>
                    <EditPermissions
                        onSave={onSavePermissions}
                        permParams={{
                            type: permissionType,
                            applyTo,
                            usersGroup: selectedGroupNode.node.id,
                            actions: [
                                PermissionsActions.access,
                                PermissionsActions.create,
                                PermissionsActions.edit,
                                PermissionsActions.delete
                            ],
                            permissionTreeTarget: {
                                tree: tree.linked_tree,
                                id: selectedTreeNode.node.id,
                                library: selectedTreeNode.node.library.id
                            }
                        }}
                    />
                </div>
            )}
        </div>
    ) : (
        <p>Cannot find tree</p>
    );
}

export default withNamespaces()(DefineTreePermissionsView);
