// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {getPermissionsQuery} from '../../../queries/permissions/getPermissionsQuery';
import {savePermissionsQuery} from '../../../queries/permissions/savePermissionMutation';
import {
    type PermissionsActions,
    type PermissionsTreeTargetInput,
    type PermissionTypes,
} from '../../../_gqlTypes/globalTypes';
import {
    type SAVE_PERMISSION,
    type SAVE_PERMISSIONVariables,
    type SAVE_PERMISSION_savePermission_actions,
} from '../../../_gqlTypes/SAVE_PERMISSION';
import Loading from '../../shared/Loading';
import EditPermissionsView from './EditPermissionsView';
import {useGetPermissionsActionsQuery, useGetPermissionsQuery} from '_gqlTypes';
import {type GET_PERMISSIONS_perm, type GET_PERMISSIONS_inheritPerm} from '_gqlTypes/GET_PERMISSIONS';
import {type GET_PERMISSIONS_ACTIONS_permissionsActionsByType} from '_gqlTypes/GET_PERMISSIONS_ACTIONS';

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
    const {
        loading: loadingActions,
        error: errorActions,
        data: dataActions,
    } = useGetPermissionsActionsQuery({
        variables: {type: permParams.type, applyOn: permParams.applyTo},
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    const actionsToEdit = (dataActions?.permissionsActionsByType ?? []).filter(
        p => !permParams.actions || permParams.actions?.includes(p.name as PermissionsActions),
    );

    const getPermsVariables = {...permParams, actions: actionsToEdit.map(a => a.name)};

    const {loading, error, data} = useGetPermissionsQuery({
        variables: getPermsVariables,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        skip: !dataActions,
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
                    actions: [permToSave],
                },
            },
            refetchQueries: [{query: getPermissionsQuery, variables: getPermsVariables}],
        });
    };

    return (
        <EditPermissionsView
            onChange={_onSave}
            actions={actionsToEdit as GET_PERMISSIONS_ACTIONS_permissionsActionsByType[]}
            permissions={data.perm as GET_PERMISSIONS_perm[]}
            inheritedPermissions={data.inheritPerm as GET_PERMISSIONS_inheritPerm[]}
            readOnly={readOnly}
        />
    );
};

export default EditPermissions;
