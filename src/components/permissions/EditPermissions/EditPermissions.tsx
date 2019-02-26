import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {getPermissionsQuery, PermissionsQuery} from '../../../queries/permissions/getPermissionsQuery';
import {SavePermissionsMutation, savePermissionsQuery} from '../../../queries/permissions/savePermissionMutation';
import {GET_PERMISSIONSVariables} from '../../../_gqlTypes/GET_PERMISSIONS';
import {SAVE_PERMISSION_savePermission_actions} from '../../../_gqlTypes/SAVE_PERMISSION';
import Loading from '../../shared/Loading';
import EditPermissionsView from '../EditPermissionsView';

interface IEditPermissionsProps extends WithNamespaces {
    permParams: GET_PERMISSIONSVariables;
}

function EditPermissions({permParams, t}: IEditPermissionsProps): JSX.Element {
    return (
        // Fetch policy is set to 'network only' to bypass the cache as it would be very challenging
        // to maintain the heritage values in the cache.
        <PermissionsQuery query={getPermissionsQuery} variables={permParams} fetchPolicy="network-only">
            {({loading, error, data}) => {
                if (loading) {
                    return <Loading />;
                }

                return (
                    <SavePermissionsMutation mutation={savePermissionsQuery}>
                        {savePerms => {
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
                                data &&
                                data.perm &&
                                data.heritPerm && (
                                    <EditPermissionsView
                                        onChange={_onSave}
                                        permissions={data.perm}
                                        heritedPermissions={data.heritPerm}
                                    />
                                )
                            );
                        }}
                    </SavePermissionsMutation>
                );
            }}
        </PermissionsQuery>
    );
}

export default withNamespaces()(EditPermissions);
