// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {NodeData, TreeNode} from 'react-sortable-tree';
import {getTreeNodeKey} from '../../../utils/utils';
import {GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute} from '../../../_gqlTypes/GET_LIB_BY_ID';
import {PermissionTypes} from '../../../_gqlTypes/globalTypes';
import ColumnsDisplay from '../../shared/ColumnsDisplay';
import DefinePermissionsViewLoadTree from '../DefinePermissionsViewLoadTree';
import EditPermissions from '../EditPermissions';

interface IDefineTreePermissionsViewProps {
    treeAttribute: GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute;
    permissionType: PermissionTypes;
    applyTo: string;
    readOnly?: boolean;
}

const DefineTreePermissionsView = ({
    treeAttribute: tree,
    permissionType,
    applyTo,
    readOnly
}: IDefineTreePermissionsViewProps): JSX.Element => {
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
                        usersGroup: selectedGroupNode.node.id !== 'root' ? selectedGroupNode.node.id : null,
                        permissionTreeTarget: {
                            tree: tree.linked_tree,
                            id: selectedTreeNode.node.id !== 'root' ? selectedTreeNode.node.id : null,
                            library:
                                selectedTreeNode.node.library.id !== 'root' ? selectedTreeNode.node.library.id : null
                        }
                    }}
                    readOnly={readOnly}
                />
            );
        }
    }

    return <ColumnsDisplay columnsNumber={3} columnsContent={cols} />;
};

DefineTreePermissionsView.defaultProps = {
    readOnly: false
};

export default DefineTreePermissionsView;
