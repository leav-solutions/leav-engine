// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getPermissionsQuery} from '../../../queries/permissions/getPermissionsQuery';
import {
    type PermissionsDependenciesTreeTargetInput,
    type PermissionsActions,
    type PermissionsTreeTargetInput,
    type PermissionTypes,
    useGetPermissionsActionsQuery,
    useGetPermissionsQuery,
    useSavePermissionMutation,
} from '../../../_gqlTypes';
import {type SAVE_PERMISSION_savePermission_actions} from '../../../_gqlTypes/SAVE_PERMISSION';
import Loading from '../../shared/Loading';
import EditPermissionsView from './EditPermissionsView';
import {type GET_PERMISSIONS_perm, type GET_PERMISSIONS_inheritPerm} from '../../../_gqlTypes/GET_PERMISSIONS';
import {type GET_PERMISSIONS_ACTIONS_permissionsActionsByType} from '../../../_gqlTypes/GET_PERMISSIONS_ACTIONS';

interface IEditPermissionParams {
    type: PermissionTypes;
    applyTo?: string | null;
    usersGroup?: string | null;
    permissionTreeTarget?: PermissionsTreeTargetInput | null;
    dependenciesTreeTargets?: PermissionsDependenciesTreeTargetInput[] | null;
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
        variables: {
            type: permParams.type,
            ...(permParams.applyTo != null && {applyOn: permParams.applyTo}),
        },
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

    const [savePerms] = useSavePermissionMutation();

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
