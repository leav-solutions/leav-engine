import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import Loading from 'src/components/shared/Loading';
import {getPermissionsQuery, PermissionsQuery} from 'src/queries/permissions/getPermissionsQuery';
import {SavePermissionsMutation, savePermissionsQuery} from 'src/queries/permissions/savePermissionMutation';
import {GET_PERMISSIONSVariables} from 'src/_gqlTypes/GET_PERMISSIONS';
import {SAVE_PERMISSION_savePermission_actions} from 'src/_gqlTypes/SAVE_PERMISSION';
import EditPermissionsView from '../EditPermissionsView';

interface IEditPermissionsProps extends WithNamespaces {
    onSave: (permData) => void;
    permParams: GET_PERMISSIONSVariables;
}

function EditPermissions({permParams, onSave, t}: IEditPermissionsProps): JSX.Element {
    return (
        <PermissionsQuery query={getPermissionsQuery} variables={permParams}>
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
                                data.permissions && (
                                    <EditPermissionsView onChange={_onSave} permissions={data.permissions} />
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
