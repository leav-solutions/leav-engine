import {NodeData, TreeNode} from '@casolutions/react-sortable-tree';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header} from 'semantic-ui-react';
import styled from 'styled-components';
import useUserData from '../../../hooks/useUserData';
import {getTreeNodeKey} from '../../../utils/utils';
import {PermissionsActions, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import ColumnsDisplay from '../../shared/ColumnsDisplay';
import DefinePermissionsViewLoadTree from '../DefinePermissionsViewLoadTree';
import EditPermissions from '../EditPermissions';

const PermBlockWrapper = styled.div`
    margin-top: 1em;
`;

const AdminPermissions = (): JSX.Element => {
    const {t} = useTranslation();
    const usersGroupsTreeId = 'users_groups';

    const userData = useUserData();
    const readOnly = !userData.permissions[PermissionsActions.app_edit_permission];

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
        const type = PermissionTypes.app;

        const permsGroups = [
            {
                id: 'libraries',
                title: t('libraries.title'),
                actions: [
                    PermissionsActions.app_access_libraries,
                    PermissionsActions.app_create_library,
                    PermissionsActions.app_edit_library,
                    PermissionsActions.app_delete_library
                ]
            },
            {
                id: 'attributes',
                title: t('attributes.title'),
                actions: [
                    PermissionsActions.app_access_attributes,
                    PermissionsActions.app_create_attribute,
                    PermissionsActions.app_edit_attribute,
                    PermissionsActions.app_delete_attribute
                ]
            },
            {
                id: 'trees',
                title: t('trees.title'),
                actions: [
                    PermissionsActions.app_access_trees,
                    PermissionsActions.app_create_tree,
                    PermissionsActions.app_edit_tree,
                    PermissionsActions.app_delete_tree
                ]
            },
            {
                id: 'forms',
                title: t('forms.title'),
                actions: [
                    PermissionsActions.app_access_forms,
                    PermissionsActions.app_create_form,
                    PermissionsActions.app_edit_form,
                    PermissionsActions.app_delete_form
                ]
            },
            {
                id: 'permissions',
                title: t('permissions.title'),
                actions: [PermissionsActions.app_access_permissions, PermissionsActions.app_edit_permission]
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
};

export default AdminPermissions;
