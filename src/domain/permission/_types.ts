// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AppPermissionsActions,
    AttributePermissionsActions,
    IPermissionsTreeTarget,
    ITreePermissionsConf,
    LibraryPermissionsActions,
    PermissionsActions,
    PermissionTypes,
    RecordAttributePermissionsActions,
    TreeNodePermissionsActions,
    TreePermissionsActions
} from '_types/permissions';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeElement, ITreeNode} from '_types/tree';

export interface IPermissionTarget {
    attributeId?: string;
    recordId?: string;
    libraryId?: string;
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
    ctx: IQueryInfos;
}

export interface IGetTreeNodePermissionParams {
    action: TreeNodePermissionsActions;
    userId: string;
    node: ITreeElement;
    treeId: string;
    ctx: IQueryInfos;
}

export interface IGetHeritedTreeNodePermissionParams {
    action: TreeNodePermissionsActions;
    userGroupId: string;
    treeId: string;
    libraryId: string;
    permTree: string;
    permTreeNode: {id: string; library: string};
    ctx: IQueryInfos;
}

export interface IGetHeritedLibraryPermissionParams {
    action: LibraryPermissionsActions;
    libraryId: string;
    userGroupId: string;
    ctx: IQueryInfos;
}

export interface IGetHeritedTreePermissionParams {
    action: TreePermissionsActions;
    treeId: string;
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

export interface IGetHeritedAttributePermissionParams {
    action: AttributePermissionsActions;
    attributeId: string;
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
    permTreeNode: {id: string; library: string};
}

export interface IGetDefaultPermissionParams {
    action?: any;
    applyTo?: string;
    userId?: string;
    userGroups?: ITreeNode[][];
}

export interface IGetTreeBasedPermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userId: string;
    applyTo: string;
    treeValues: {[treeAttributeId: string]: ITreeNode[]};
    permissions_conf: ITreePermissionsConf;
    getDefaultPermission: (params: IGetDefaultPermissionParams) => Promise<boolean> | boolean;
}

export interface IGetHeritedTreeBasedPermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userGroupId: string;
    applyTo: string;
    permissionTreeTarget: IPermissionsTreeTarget;
    getDefaultPermission: (params: IGetDefaultPermissionParams) => Promise<boolean> | boolean;
}
