import {NodeData, TreeNode} from '@casolutions/react-sortable-tree';
import React from 'react';
import {getTreeNodeKey} from '../../../utils/utils';
import {PermissionTypes} from '../../../_gqlTypes/globalTypes';
import ColumnsDisplay from '../../shared/ColumnsDisplay';
import DefinePermissionsViewLoadTree from '../DefinePermissionsViewLoadTree';
import EditPermissions from '../EditPermissions';

interface IDefineLibPermissionsViewProps {
    applyTo: string;
    readOnly: boolean;
}

function DefineLibPermissionsView({applyTo, readOnly}: IDefineLibPermissionsViewProps): JSX.Element {
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
                    usersGroup: selectedGroupNode.node.id !== 'root' ? selectedGroupNode.node.id : null
                }}
                readOnly={readOnly}
            />
        );
    }

    return <ColumnsDisplay columnsNumber={2} columnsContent={cols} />;
}

export default DefineLibPermissionsView;
