import * as React from 'react';
import {NodeData, TreeNode} from 'react-sortable-tree';
import ColumnsDisplay from 'src/components/shared/ColumnsDisplay';
import {getTreeNodeKey} from 'src/utils/utils';
import {PermissionsActions, PermissionTypes} from 'src/_gqlTypes/globalTypes';
import DefinePermissionsViewLoadTree from '../DefinePermissionsViewLoadTree';
import EditPermissions from '../EditPermissions';

interface IDefineLibPermissionsViewProps {
    applyTo: string;
}

function DefineLibPermissionsView({applyTo}: IDefineLibPermissionsViewProps): JSX.Element {
    const usersGroupsTreeId = 'users_groups';

    const [selectedGroupNode, setSelectedGroupNode] = React.useState<NodeData | null>(null);

    const _selectGroupNode = (nodeData: NodeData) =>
        setSelectedGroupNode(
            getTreeNodeKey(nodeData) !== getTreeNodeKey(selectedGroupNode as TreeNode) ? nodeData : null
        );

    const cols = [
        <DefinePermissionsViewLoadTree
            key="users_groups"
            treeId={usersGroupsTreeId}
            onClick={_selectGroupNode}
            selectedNode={selectedGroupNode}
        />
    ];

    if (selectedGroupNode) {
        cols.push(
            <EditPermissions
                permParams={{
                    type: PermissionTypes.library,
                    applyTo,
                    usersGroup: selectedGroupNode.node.id,
                    actions: [
                        PermissionsActions.access,
                        PermissionsActions.create,
                        PermissionsActions.edit,
                        PermissionsActions.delete
                    ]
                }}
            />
        );
    }

    return <ColumnsDisplay columnsNumber={2} columnsContent={cols} />;
}

export default DefineLibPermissionsView;
