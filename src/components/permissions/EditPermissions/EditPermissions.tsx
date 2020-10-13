import {useMutation, useQuery} from '@apollo/react-hooks';
import React from 'react';
import {getPermissionsQuery} from '../../../queries/permissions/getPermissionsQuery';
import {savePermissionsQuery} from '../../../queries/permissions/savePermissionMutation';
import {GET_PERMISSIONS, GET_PERMISSIONSVariables} from '../../../_gqlTypes/GET_PERMISSIONS';
import {PermissionsActions, PermissionsTreeTargetInput, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import {
    SAVE_PERMISSION,
    SAVE_PERMISSIONVariables,
    SAVE_PERMISSION_savePermission_actions
} from '../../../_gqlTypes/SAVE_PERMISSION';
import Loading from '../../shared/Loading';
import EditPermissionsView from '../EditPermissionsView';

interface IEditPermissionParams {
    type: PermissionTypes;
    applyTo?: string | null;
    actions: PermissionsActions[];
    usersGroup?: string | null;
    permissionTreeTarget?: PermissionsTreeTargetInput | null;
}

interface IEditPermissionsProps {
    permParams: IEditPermissionParams;
    readOnly?: boolean;
}

const EditPermissions = ({permParams, readOnly = false}: IEditPermissionsProps): JSX.Element => {
    const {loading, error, data} = useQuery<GET_PERMISSIONS, GET_PERMISSIONSVariables>(getPermissionsQuery, {
        variables: permParams,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true
    });

    const [savePerms] = useMutation<SAVE_PERMISSION, SAVE_PERMISSIONVariables>(savePermissionsQuery);

    if (loading) {
        return <Loading />;
    }

    if (error || !(data?.perm && data?.heritPerm)) {
        return (
            <div className="error" data-test-id="error">
                Error fetching permissions {error?.toString()}
            </div>
        );
    }

    const _onSave = (permToSave: SAVE_PERMISSION_savePermission_actions) =>
        savePerms({
            variables: {
                permData: {
                    ...permParams,
                    actions: [permToSave]
                }
            },
            refetchQueries: [{query: getPermissionsQuery, variables: permParams}]
        });

    return (
        <EditPermissionsView
            onChange={_onSave}
            permissions={data.perm}
            heritedPermissions={data.heritPerm}
            readOnly={readOnly}
        />
    );
};

export default EditPermissions;
