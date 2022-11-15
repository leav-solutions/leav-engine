// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ISystemTranslation} from './systemTranslation';

export enum PermissionTypes {
    RECORD = 'record',
    RECORD_ATTRIBUTE = 'record_attribute',
    ADMIN = 'admin',
    LIBRARY = 'library',
    ATTRIBUTE = 'attribute',
    TREE = 'tree',
    TREE_NODE = 'tree_node',
    TREE_LIBRARY = 'tree_library',
    APPLICATION = 'application'
}

export enum LibraryPermissionsActions {
    ACCESS_LIBRARY = 'access_library',
    ADMIN_LIBRARY = 'admin_library',
    ACCESS_RECORD = 'access_record',
    CREATE_RECORD = 'create_record',
    EDIT_RECORD = 'edit_record',
    DELETE_RECORD = 'delete_record'
}

export enum RecordPermissionsActions {
    ACCESS_RECORD = 'access_record',
    CREATE_RECORD = 'create_record',
    EDIT_RECORD = 'edit_record',
    DELETE_RECORD = 'delete_record'
}

export enum RecordAttributePermissionsActions {
    ACCESS_ATTRIBUTE = 'access_attribute',
    EDIT_VALUE = 'edit_value'
}

export enum AttributePermissionsActions {
    ACCESS_ATTRIBUTE = 'access_attribute',
    EDIT_VALUE = 'edit_value'
}

export enum TreePermissionsActions {
    ACCESS_TREE = 'access_tree',
    EDIT_CHILDREN = 'edit_children'
}

export enum TreeNodePermissionsActions {
    ACCESS_TREE = 'access_tree',
    DETACH = 'detach',
    EDIT_CHILDREN = 'edit_children'
}

export enum ApplicationPermissionsActions {
    ADMIN_APPLICATION = 'admin_application',
    ACCESS_APPLICATION = 'access_application'
}

export enum AdminPermissionsActions {
    ACCESS_LIBRARIES = 'admin_access_libraries',
    CREATE_LIBRARY = 'admin_create_library',
    EDIT_LIBRARY = 'admin_edit_library',
    DELETE_LIBRARY = 'admin_delete_library',
    ACCESS_TASKS = 'admin_access_tasks',
    DELETE_TASK = 'admin_delete_task',
    CANCEL_TASK = 'admin_cancel_task',
    ACCESS_ATTRIBUTES = 'admin_access_attributes',
    CREATE_ATTRIBUTE = 'admin_create_attribute',
    EDIT_ATTRIBUTE = 'admin_edit_attribute',
    DELETE_ATTRIBUTE = 'admin_delete_attribute',
    ACCESS_TREES = 'admin_access_trees',
    CREATE_TREE = 'admin_create_tree',
    EDIT_TREE = 'admin_edit_tree',
    DELETE_TREE = 'admin_delete_tree',
    ACCESS_VERSION_PROFILES = 'admin_access_version_profiles',
    CREATE_VERSION_PROFILE = 'admin_create_version_profile',
    EDIT_VERSION_PROFILE = 'admin_edit_version_profile',
    DELETE_VERSION_PROFILE = 'admin_delete_version_profile',
    ACCESS_PERMISSIONS = 'admin_access_permissions',
    EDIT_PERMISSION = 'admin_edit_permission',
    MANAGE_GLOBAL_PREFERENCES = 'admin_manage_global_preferences',
    ACCESS_APPLICATIONS = 'admin_access_applications',
    CREATE_APPLICATION = 'admin_create_application',
    EDIT_APPLICATION = 'admin_edit_application',
    DELETE_APPLICATION = 'admin_delete_application',
    ACCESS_API_KEYS = 'admin_access_api_keys',
    CREATE_API_KEY = 'admin_create_api_key',
    EDIT_API_KEY = 'admin_edit_api_key',
    DELETE_API_KEY = 'admin_delete_api_key'
}

export type PermissionsActions =
    | LibraryPermissionsActions
    | RecordPermissionsActions
    | RecordAttributePermissionsActions
    | AdminPermissionsActions
    | AttributePermissionsActions
    | TreePermissionsActions
    | TreeNodePermissionsActions
    | ApplicationPermissionsActions;

export interface ILabeledPermissionsAction {
    label: ISystemTranslation;
    name: PermissionsActions | string;
}

export enum PermissionsRelations {
    AND = 'and',
    OR = 'or'
}

export interface ITreeNodePermissionsConf {
    [libraryId: string]: ITreePermissionsConf;
}

export interface ITreePermissionsConf {
    /**
     * IDs of attributes used for permissions
     */
    permissionTreeAttributes: string[];

    /**
     * Relation between those trees when retrieving permission
     */
    relation: PermissionsRelations;
}

export interface IPermissionsTreeTarget {
    /**
     * Tree ID
     */
    tree: string;

    /**
     * Tree element's ID
     */
    nodeId: string | null;
}

export interface IPermission {
    /**
     * Permission type
     */
    type: PermissionTypes;

    /**
     * What this permission applies to? Can be a library, an attribute...
     */
    applyTo?: string;

    /**
     * Users group concerned by this permission. If null, applies to root level
     */
    usersGroup: string | null;

    /**
     * Permission by action: create, edit...
     * Set an action to null to herit from its parent when using in a record or attribute permission
     */
    actions: {[name: string]: boolean | null};

    /**
     * What element on permissions tree is concerned by this permission
     */
    permissionTreeTarget?: IPermissionsTreeTarget;
}
