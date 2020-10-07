import {
    AppPermissionsActions,
    IPermissionsTreeTarget,
    LibraryPermissionsActions,
    PermissionsActions,
    PermissionTypes
} from '_types/permissions';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeNode} from '_types/tree';

export interface IPermissionTarget {
    attributeId?: string;
    recordId?: string;
}

export interface IGetSimplePermissionsParams {
    type: PermissionTypes;
    applyTo: string | null;
    action: PermissionsActions;
    usersGroupId: string;
    permissionTreeTarget?: IPermissionsTreeTarget;
    ctx: IQueryInfos;
}

export interface IGetPermissionsByActionsParams {
    type: PermissionTypes;
    applyTo: string | null;
    actions: PermissionsActions[];
    usersGroupId: string;
    permissionTreeTarget?: IPermissionsTreeTarget;
    ctx: IQueryInfos;
}

export type PermByActionsRes = {[name: string]: boolean | null} | null;

export interface IGetPermissionByUserGroupsParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userGroupsPaths: ITreeNode[][];
    applyTo?: string;
    permissionTreeTarget?: IPermissionsTreeTarget;
    ctx: IQueryInfos;
}

export interface IGetAppPermissionParams {
    action: AppPermissionsActions;
    userId: string;
    ctx: IQueryInfos;
}

export interface IGetHeritedAppPermissionParams {
    action: AppPermissionsActions;
    userGroupId: string;
    ctx: IQueryInfos;
}

export interface IGetLibraryPermissionParams {
    action: LibraryPermissionsActions;
    libraryId: string;
    userId: string;
    ctx: IQueryInfos;
}

export interface IGetHeritedLibraryPermissionParams {
    action: LibraryPermissionsActions;
    libraryId: string;
    userGroupId: string;
    ctx: IQueryInfos;
}

export interface IGetHeritedPermissionsParams {
    type: PermissionTypes;
    applyTo: string;
    action: PermissionsActions;
    userGroupId: string;
    permissionTreeTarget?: IPermissionsTreeTarget;
    ctx: IQueryInfos;
}

export interface IIsAllowedParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userId: string;
    applyTo?: string;
    target?: IPermissionTarget;
    ctx: IQueryInfos;
}
