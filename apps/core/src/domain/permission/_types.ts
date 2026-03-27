// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type IPermissionsDependenciesTreeTarget,
    type AdminPermissionsActions,
    type ApplicationPermissionsActions,
    type AttributePermissionsActions,
    type IPermissionsTreeTarget,
    type ITreePermissionsConf,
    type LibraryPermissionsActions,
    type PermissionsActions,
    type PermissionTypes,
    type RecordAttributePermissionsActions,
    type RecordPermissionsActions,
    type TreeNodePermissionsActions,
    type TreePermissionsActions,
} from '../../_types/permissions';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type TreePath} from '../../_types/tree';
import {type IGetDefaultPermissionParams} from './helpers/defaultPermission';

export const PERMISSIONS_CACHE_HEADER = 'permissions';
export const PERMISSIONS_NULL_PLACEHOLDER = '__null__';

export interface IPermissionTarget {
    attributeId?: string;
    recordId?: string;
    libraryId?: string;
    nodeId?: string;
}

export interface IGetSimplePermissionsParams {
    type: PermissionTypes;
    applyTo: string | null;
    action: PermissionsActions;
    usersGroupNodeId: string;
    permissionTreeTarget?: IPermissionsTreeTarget;
    dependenciesTreeTargets?: IPermissionsDependenciesTreeTarget[];
    ctx: IQueryInfos;
}

export interface IGetPermissionsByActionsParams {
    type: PermissionTypes;
    applyTo: string | null;
    actions: PermissionsActions[];
    usersGroupNodeId: string;
    permissionTreeTarget?: IPermissionsTreeTarget;
    dependenciesTreeTargets?: IPermissionsDependenciesTreeTarget[];
    ctx: IQueryInfos;
}

export type PermByActionsRes = {[name: string]: boolean | null} | null;

export interface IGetAdminPermissionParams {
    action: AdminPermissionsActions;
    ctx: IQueryInfos;
}

export interface IGetInheritedAdminPermissionParams {
    action: AdminPermissionsActions;
    userGroupId: string;
    ctx: IQueryInfos;
}

export interface IGetLibraryPermissionParams {
    action: LibraryPermissionsActions;
    libraryId: string;
    ctx: IQueryInfos;
}

export interface IGetTreePermissionParams {
    action: TreePermissionsActions;
    treeId: string;
    ctx: IQueryInfos;
}

export type GetDefaultTreeLibraryPermission = (params: IGetDefaultPermissionParams) => boolean | null;

export interface IGetTreeLibraryPermissionParams {
    action: TreeNodePermissionsActions;
    treeId: string;
    libraryId: string;
    getDefaultTreeLibraryPermission?: GetDefaultTreeLibraryPermission;
    ctx: IQueryInfos;
}

export interface IGetApplicationPermissionParams {
    action: ApplicationPermissionsActions;
    applicationId: string;
    ctx: IQueryInfos;
}

export interface IGetDefaultGlobalPermissionParams extends IGetDefaultPermissionParams {
    applyTo?: string;
}

export type GetDefaultGlobalPermission = (params: IGetDefaultGlobalPermissionParams) => Promise<boolean> | boolean;

export interface IGetTreeNodePermissionParams {
    action: TreeNodePermissionsActions;
    nodeId: string;
    treeId: string;
    ctx: IQueryInfos;
}

export interface IGetInheritedTreeNodePermissionParams {
    action: TreeNodePermissionsActions;
    userGroupId: string;
    treeId: string;
    libraryId: string;
    permTree: string;
    permTreeNode: string;
    ctx: IQueryInfos;
}

export interface IGetInheritedLibraryPermissionParams {
    action: LibraryPermissionsActions;
    libraryId: string;
    userGroupId: string;
    ctx: IQueryInfos;
}

export interface IGetInheritedTreePermissionParams {
    action: TreePermissionsActions;
    treeId: string;
    userGroupId: string;
    ctx: IQueryInfos;
}

export interface IGetInheritedApplicationPermissionParams {
    action: ApplicationPermissionsActions;
    applicationId: string;
    userGroupId: string;
    ctx: IQueryInfos;
}

export interface IGetInheritedTreeLibraryPermissionParams {
    action: TreeNodePermissionsActions;
    treeId: string;
    libraryId: string;
    userGroupId: string;
    ctx: IQueryInfos;
}

export interface IGetAttributePermissionParams {
    action: AttributePermissionsActions;
    attributeId: string;
    ctx: IQueryInfos;
}

export interface IGetInheritedAttributePermissionParams {
    action: AttributePermissionsActions;
    attributeId: string;
    userGroupId: string;
    ctx: IQueryInfos;
}

export interface IGetInheritedPermissionsParams {
    type: PermissionTypes;
    applyTo: string;
    action: PermissionsActions;
    userGroupId: string;
    permissionTreeTarget?: IPermissionsTreeTarget;
    dependenciesTreeTargets?: IPermissionsDependenciesTreeTarget[];
    ctx: IQueryInfos;
}

export interface IIsAllowedParams {
    type: PermissionTypes;
    action: PermissionsActions;
    applyTo?: string;
    target?: IPermissionTarget;
    ctx: IQueryInfos;
}
export interface IGetActionsByTypeParams {
    type: PermissionTypes;
    ctx: IQueryInfos;
    applyOn?: string;
    skipApplyOn?: boolean;
}
export interface IGetRecordAttributeHeritedPermissionsParams {
    action: RecordAttributePermissionsActions;
    attributeId: string;
    userGroupId: string;
    permTree: string;
    permTreeNode: string;
}

export interface IGetTreeBasedPermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    applyTo: string;
    treeValues: {[treeAttributeId: string]: string[]};
    permissions_conf: ITreePermissionsConf;
    getDefaultPermission: GetDefaultGlobalPermission;
}

export interface IGetInheritedTreeBasedPermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userGroupId: string;
    applyTo: string;
    permissionTreeTarget: IPermissionsTreeTarget;
    getDefaultPermission: GetDefaultGlobalPermission;
}

export interface IGetRecordPermissionParams {
    action: RecordPermissionsActions;
    library: string;
    recordId: string;
    ctx: IQueryInfos;
}

export interface IGetInheritedRecordPermissionParams {
    action: RecordPermissionsActions;
    userGroupId: string;
    library: string;
    permTree: string;
    permTreeNode: string;
    ctx: IQueryInfos;
}

export interface IEstimateTreeValueRecordPermissionParams {
    action: RecordPermissionsActions;
    libraryId: string;
    attributeId: string;
    nodeId: string;
    ctx: IQueryInfos;
}
