import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {NodeData, TreeNode} from 'react-sortable-tree';
import {Header} from 'semantic-ui-react';
import {getTreeNodeKey} from '../../../utils/utils';
import {PermissionsActions, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import ColumnsDisplay from '../../shared/ColumnsDisplay';
import DefinePermissionsViewLoadTree from '../DefinePermissionsViewLoadTree';
import EditPermissions from '../EditPermissions';

function AdminPermissions({t}: WithNamespaces): JSX.Element {
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
        const usersGroup = selectedGroupNode.node.id !== 'root' ? selectedGroupNode.node.id : null;
        const type = PermissionTypes.admin;
        cols.push(
            <div className="flex-col">
                <h4>{t('libraries.title')}</h4>
                <EditPermissions
                    permParams={{
                        type,
                        usersGroup,
                        actions: [
                            PermissionsActions.admin_access_libraries,
                            PermissionsActions.admin_create_library,
                            PermissionsActions.admin_edit_library,
                            PermissionsActions.admin_delete_library
                        ]
                    }}
                />
                <h4>{t('attributes.title')}</h4>
                <EditPermissions
                    permParams={{
                        type,
                        usersGroup,
                        actions: [
                            PermissionsActions.admin_access_attributes,
                            PermissionsActions.admin_create_attribute,
                            PermissionsActions.admin_edit_attribute,
                            PermissionsActions.admin_delete_attribute
                        ]
                    }}
                />
                <h4>{t('trees.title')}</h4>
                <EditPermissions
                    permParams={{
                        type,
                        usersGroup,
                        actions: [
                            PermissionsActions.admin_access_trees,
                            PermissionsActions.admin_create_tree,
                            PermissionsActions.admin_edit_tree,
                            PermissionsActions.admin_delete_tree
                        ]
                    }}
                />
                <h4>{t('permissions.title')}</h4>
                <EditPermissions
                    permParams={{
                        type,
                        usersGroup,
                        actions: [PermissionsActions.admin_access_permissions, PermissionsActions.admin_edit_permission]
                    }}
                />
            </div>
        );
    }

    return (
        <React.Fragment>
            <Header className="no-grow">{t('permissions.title')}</Header>
            <ColumnsDisplay columnsNumber={2} columnsContent={cols} />
        </React.Fragment>
    );
}

export default withNamespaces()(AdminPermissions);
