// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AdminPermissionsActions,
    ApplicationPermissionsActions,
    AttributePermissionsActions,
    IPermissionsTreeTarget,
    ITreePermissionsConf,
    LibraryPermissionsActions,
    PermissionsActions,
    PermissionTypes,
    RecordAttributePermissionsActions,
    RecordPermissionsActions,
    TreeNodePermissionsActions,
    TreePermissionsActions
} from '_types/permissions';
import {IQueryInfos} from '_types/queryInfos';
import {TreePaths} from '_types/tree';

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
    ctx: IQueryInfos;
}

export interface IGetPermissionsByActionsParams {
    type: PermissionTypes;
    applyTo: string | null;
    actions: PermissionsActions[];
    usersGroupNodeId: string;
    permissionTreeTarget?: IPermissionsTreeTarget;
    ctx: IQueryInfos;
}

export type PermByActionsRes = {[name: string]: boolean | null} | null;

export interface IGetPermissionByUserGroupsParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userGroupsPaths: TreePaths[];
    applyTo?: string;
    permissionTreeTarget?: IPermissionsTreeTarget;
    ctx: IQueryInfos;
}

export interface IGetAdminPermissionParams {
    action: AdminPermissionsActions;
    userId: string;
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
    userId: string;
    ctx: IQueryInfos;
}

export interface IGetTreePermissionParams {
    action: TreePermissionsActions;
    treeId: string;
    userId: string;
    ctx: IQueryInfos;
}

export interface IGetTreeLibraryPermissionParams {
    action: TreeNodePermissionsActions;
    treeId: string;
    libraryId: string;
    userId: string;
    getDefaultPermission?: (params?: IGetDefaultTreeLibraryPermissionParams) => boolean | null;
    ctx: IQueryInfos;
}

export interface IGetApplicationPermissionParams {
    action: ApplicationPermissionsActions;
    applicationId: string;
    userId: string;
    ctx: IQueryInfos;
}

export interface IGetDefaultTreeLibraryPermissionParams {
    type?: PermissionTypes;
    applyTo?: string;
    userId?: string;
    action?: PermissionsActions;
    ctx: IQueryInfos;
}

export interface IGetTreeNodePermissionParams {
    action: TreeNodePermissionsActions;
    userId: string;
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

export interface IGetDefaultInheritedTreeLibraryPermissionParams {
    type?: PermissionTypes;
    applyTo?: string;
    userId?: string;
    action?: PermissionsActions;
    ctx: IQueryInfos;
}

export interface IGetInheritedTreeLibraryPermissionParams {
    action: TreeNodePermissionsActions;
    treeId: string;
    libraryId: string;
    userGroupId: string;
    getDefaultPermission?: (params?: IGetDefaultInheritedTreeLibraryPermissionParams) => boolean | null;
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
export interface IGetActionsByTypeParams {
    type: PermissionTypes;
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

export interface IGetDefaultPermissionParams {
    action?: any;
    applyTo?: string;
    userId?: string;
    userGroups?: TreePaths[];
}

export interface IGetTreeBasedPermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userId: string;
    applyTo: string;
    treeValues: {[treeAttributeId: string]: string[]};
    permissions_conf: ITreePermissionsConf;
    getDefaultPermission: (params: IGetDefaultPermissionParams) => Promise<boolean> | boolean;
}

export interface IGetInheritedTreeBasedPermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userGroupId: string;
    applyTo: string;
    permissionTreeTarget: IPermissionsTreeTarget;
    getDefaultPermission: (params: IGetDefaultPermissionParams) => Promise<boolean> | boolean;
}

export interface IGetRecordPermissionParams {
    action: RecordPermissionsActions;
    userId: string;
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
