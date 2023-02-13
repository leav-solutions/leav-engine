// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {IGroupedPermissionsActions} from '_types/permissions';
import {fakeRootId, ITreeNodeData} from '_types/trees';
import {getTreeNodeKey} from '../../../utils/utils';
import {PermissionTypes} from '../../../_gqlTypes/globalTypes';
import ColumnsDisplay from '../../shared/ColumnsDisplay';
import DefinePermissionsViewLoadTree from '../DefinePermissionsViewLoadTree';
import EditPermissions from '../EditPermissions';
import PermissionsActionsGroupSelector from '../PermissionsActionsGroupSelector';

interface IDefinePermByUserGroupViewProps {
    applyTo?: string;
    readOnly?: boolean;
    type: PermissionTypes;
    actions?: IGroupedPermissionsActions;
}

function DefinePermByUserGroupView({applyTo, readOnly, type, actions}: IDefinePermByUserGroupViewProps): JSX.Element {
    const usersGroupsTreeId = 'users_groups';

    const [selectedGroupNode, setSelectedGroupNode] = useState<ITreeNodeData | null>({
        node: {id: fakeRootId},
        path: [],
        treeIndex: 0
    });

    // Select first group by default
    const [selectedPermissionsGroup, setSelectedPermissionsGroup] = useState<string>(
        actions ? Object.keys(actions)[0] : null
    );

    const _selectGroupNode = (nodeData: ITreeNodeData) =>
        setSelectedGroupNode(getTreeNodeKey(nodeData) !== getTreeNodeKey(selectedGroupNode) ? nodeData : null);

    const maxColsCount = actions ? 3 : 2;
    const cols = [];

    const _handleSelectPermissionsGroup = (selectedGroup: string) => {
        setSelectedPermissionsGroup(selectedGroup);
    };

    if (actions) {
        cols.push(
            <PermissionsActionsGroupSelector
                actions={actions}
                type={type}
                selectedGroup={selectedPermissionsGroup}
                onSelect={_handleSelectPermissionsGroup}
            />
        );
    }

    if (!actions || selectedPermissionsGroup) {
        cols.push([
            <DefinePermissionsViewLoadTree
                key="users_groups"
                treeId={usersGroupsTreeId}
                onClick={_selectGroupNode}
                selectedNode={selectedGroupNode}
            />
        ]);
    }

    if (selectedGroupNode) {
        cols.push(
            <EditPermissions
                permParams={{
                    type,
                    actions: actions?.[selectedPermissionsGroup],
                    applyTo,
                    usersGroup: selectedGroupNode.node.id !== 'root' ? selectedGroupNode.node.id : null
                }}
                readOnly={readOnly}
            />
        );
    }

    return <ColumnsDisplay columnsNumber={maxColsCount} columnsContent={cols} />;
}

export default DefinePermByUserGroupView;
