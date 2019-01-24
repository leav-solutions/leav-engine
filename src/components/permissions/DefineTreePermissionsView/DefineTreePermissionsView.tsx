import * as React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {NodeData, TreeNode} from 'react-sortable-tree';
import ColumnsDisplay from 'src/components/shared/ColumnsDisplay';
import {getTreeNodeKey} from 'src/utils/utils';
import {GET_LIBRARIES_libraries_permissionsConf_permissionTreeAttributes} from 'src/_gqlTypes/GET_LIBRARIES';
import {PermissionsActions, PermissionTypes} from 'src/_gqlTypes/globalTypes';
import DefinePermissionsViewLoadTree from '../DefinePermissionsViewLoadTree';
import EditPermissions from '../EditPermissions';

interface IDefineTreePermissionsViewProps extends WithNamespaces {
    treeAttribute: GET_LIBRARIES_libraries_permissionsConf_permissionTreeAttributes;
    permissionType: PermissionTypes;
    applyTo: string;
}

function DefineTreePermissionsView({
    treeAttribute: tree,
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

    if (!tree.linked_tree) {
        return <p>Cannot find tree</p>;
    }

    const cols = [
        <DefinePermissionsViewLoadTree
            key="perm_tree"
            treeId={tree.linked_tree}
            onClick={_selectTreeNode}
            selectedNode={selectedTreeNode}
        />
    ];

    if (selectedTreeNode) {
        cols.push(
            <DefinePermissionsViewLoadTree
                treeId={usersGroupsTreeId}
                onClick={_selectGroupNode}
                selectedNode={selectedGroupNode}
            />
        );

        if (selectedGroupNode) {
            cols.push(
                <EditPermissions
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
            );
        }
    }

    return <ColumnsDisplay columnsNumber={3} columnsContent={cols} />;
}

export default withNamespaces()(DefineTreePermissionsView);
