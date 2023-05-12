// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import React from 'react';
import {getPermissionsActionsQuery} from '../../../queries/permissions/getPermissionsActionsQuery';
import {getPermissionsQuery} from '../../../queries/permissions/getPermissionsQuery';
import {savePermissionsQuery} from '../../../queries/permissions/savePermissionMutation';
import {GET_PERMISSIONS, GET_PERMISSIONSVariables} from '../../../_gqlTypes/GET_PERMISSIONS';
import {GET_PERMISSIONS_ACTIONS, GET_PERMISSIONS_ACTIONSVariables} from '../../../_gqlTypes/GET_PERMISSIONS_ACTIONS';
import {PermissionsActions, PermissionsTreeTargetInput, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import {
    SAVE_PERMISSION,
    SAVE_PERMISSIONVariables,
    SAVE_PERMISSION_savePermission_actions
} from '../../../_gqlTypes/SAVE_PERMISSION';
import Loading from '../../shared/Loading';
import EditPermissionsView from './EditPermissionsView';

interface IEditPermissionParams {
    type: PermissionTypes;
    applyTo?: string | null;
    usersGroup?: string | null;
    permissionTreeTarget?: PermissionsTreeTargetInput | null;
    actions?: PermissionsActions[];
}

interface IEditPermissionsProps {
    permParams: IEditPermissionParams;
    readOnly?: boolean;
}

const EditPermissions = ({permParams, readOnly = false}: IEditPermissionsProps): JSX.Element => {
    const {loading: loadingActions, error: errorActions, data: dataActions} = useQuery<
        GET_PERMISSIONS_ACTIONS,
        GET_PERMISSIONS_ACTIONSVariables
    >(getPermissionsActionsQuery, {
        variables: {type: permParams.type, applyOn: permParams.applyTo},
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true
    });

    const actionsToEdit = (dataActions?.permissionsActionsByType ?? []).filter(
        p => !permParams.actions || permParams.actions?.includes(p.name)
    );

    const getPermsVariables = {...permParams, actions: actionsToEdit.map(a => a.name)};

    const {loading, error, data} = useQuery<GET_PERMISSIONS, GET_PERMISSIONSVariables>(getPermissionsQuery, {
        variables: getPermsVariables,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        skip: !dataActions
    });

    const [savePerms] = useMutation<SAVE_PERMISSION, SAVE_PERMISSIONVariables>(savePermissionsQuery);

    if (loadingActions || loading) {
        return <Loading />;
    }

    if (error || errorActions || !(data?.perm && data?.inheritPerm)) {
        return (
            <div className="error" data-test-id="error">
                Error fetching permissions {errorActions?.toString()} {error?.toString()}
            </div>
        );
    }

    const _onSave = async (permToSave: SAVE_PERMISSION_savePermission_actions) => {
        await savePerms({
            variables: {
                permData: {
                    ...permParams,
                    actions: [permToSave]
                }
            },
            refetchQueries: [{query: getPermissionsQuery, variables: getPermsVariables}]
        });
    };

    return (
        <EditPermissionsView
            onChange={_onSave}
            actions={actionsToEdit}
            permissions={data.perm}
            inheritedPermissions={data.inheritPerm}
            readOnly={readOnly}
        />
    );
};

export default EditPermissions;
