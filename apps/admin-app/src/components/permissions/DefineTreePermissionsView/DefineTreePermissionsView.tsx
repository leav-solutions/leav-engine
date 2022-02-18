// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {fakeRootId, ITreeNodeData} from '_types/trees';
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
    const [selectedTreeNode, setSelectedTreeNode] = React.useState<ITreeNodeData | null>(null);
    const [selectedGroupNode, setSelectedGroupNode] = React.useState<ITreeNodeData | null>(null);
    const _selectTreeNode = (nodeData: ITreeNodeData) =>
        setSelectedTreeNode(getTreeNodeKey(nodeData) !== getTreeNodeKey(selectedTreeNode) ? nodeData : null);

    const _selectGroupNode = (nodeData: ITreeNodeData) =>
        setSelectedGroupNode(getTreeNodeKey(nodeData) !== getTreeNodeKey(selectedGroupNode) ? nodeData : null);

    if (!tree.linked_tree) {
        return <p>Cannot find tree</p>;
    }

    const cols = [
        <DefinePermissionsViewLoadTree
            key="perm_tree"
            treeId={tree.linked_tree.id}
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
                        usersGroup: selectedGroupNode.node.id !== fakeRootId ? selectedGroupNode.node.id : null,
                        permissionTreeTarget: {
                            tree: tree.linked_tree.id,
                            nodeId: selectedTreeNode.node.id !== fakeRootId ? selectedTreeNode.node.id : null
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
