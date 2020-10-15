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

const AppPermissions = (): JSX.Element => {
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

        cols.push(
            <div className="flex-col">
                <EditPermissions
                    permParams={{
                        type,
                        usersGroup
                    }}
                    readOnly={readOnly}
                />
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

export default AppPermissions;
