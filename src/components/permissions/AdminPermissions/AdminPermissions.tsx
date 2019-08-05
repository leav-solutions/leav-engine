import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {NodeData, TreeNode} from 'react-sortable-tree';
import {Header} from 'semantic-ui-react';
import styled from 'styled-components';
import useUserData from '../../../hooks/useUserData';
import {getTreeNodeKey} from '../../../utils/utils';
import {PermissionsActions, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import ColumnsDisplay from '../../shared/ColumnsDisplay';
import DefinePermissionsViewLoadTree from '../DefinePermissionsViewLoadTree';
import EditPermissions from '../EditPermissions';

/* tslint:disable-next-line:variable-name */
const PermBlockWrapper = styled.div`
    margin-top: 1em;
`;

function AdminPermissions({t}: WithNamespaces): JSX.Element {
    const usersGroupsTreeId = 'users_groups';

    const userData = useUserData();
    const readOnly = !userData.permissions[PermissionsActions.admin_edit_permission];

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

        const permsGroups = [
            {
                id: 'libraries',
                title: t('libraries.title'),
                actions: [
                    PermissionsActions.admin_access_libraries,
                    PermissionsActions.admin_create_library,
                    PermissionsActions.admin_edit_library,
                    PermissionsActions.admin_delete_library
                ]
            },
            {
                id: 'attributes',
                title: t('attributes.title'),
                actions: [
                    PermissionsActions.admin_access_attributes,
                    PermissionsActions.admin_create_attribute,
                    PermissionsActions.admin_edit_attribute,
                    PermissionsActions.admin_delete_attribute
                ]
            },
            {
                id: 'trees',
                title: t('trees.title'),
                actions: [
                    PermissionsActions.admin_access_trees,
                    PermissionsActions.admin_create_tree,
                    PermissionsActions.admin_edit_tree,
                    PermissionsActions.admin_delete_tree
                ]
            },
            {
                id: 'permissions',
                title: t('permissions.title'),
                actions: [PermissionsActions.admin_access_permissions, PermissionsActions.admin_edit_permission]
            }
        ];

        cols.push(
            <div className="flex-col">
                {permsGroups.map(group => (
                    <PermBlockWrapper key={group.id}>
                        <h4>{group.title}</h4>
                        <EditPermissions
                            permParams={{
                                type,
                                usersGroup,
                                actions: group.actions
                            }}
                            readOnly={readOnly}
                        />
                    </PermBlockWrapper>
                ))}
            </div>
        );
    }

    return (
        <>
            <Header className="no-grow">{t('permissions.title')}</Header>
            <ColumnsDisplay columnsNumber={2} columnsContent={cols} />
        </>
    );
}

export default withNamespaces()(AdminPermissions);
