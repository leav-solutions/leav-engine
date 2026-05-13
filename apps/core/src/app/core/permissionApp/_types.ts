import {
    type IPermissionsDependenciesTreeTarget,
    type IPermissionsTreeTarget,
    type PermissionsActions,
    type PermissionTypes,
} from '../../../_types/permissions';

export interface IInheritedPermissionsQueryParams {
    type: PermissionTypes;
    applyTo: string;
    actions: PermissionsActions[];
    userGroupNodeId: string;
    permissionTreeTarget: IPermissionsTreeTarget;
    dependenciesTreeTargets: IPermissionsDependenciesTreeTarget[];
}
