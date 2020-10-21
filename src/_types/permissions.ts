import {ISystemTranslation} from './systemTranslation';

export enum PermissionTypes {
    RECORD = 'record',
    RECORD_ATTRIBUTE = 'record_attribute',
    APP = 'app',
    LIBRARY = 'library',
    ATTRIBUTE = 'attribute'
}

export enum LibraryPermissionsActions {
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
    CREATE_VALUE = 'create_value',
    EDIT_VALUE = 'edit_value',
    DELETE_VALUE = 'delete_value'
}

export enum AttributePermissionsActions {
    ACCESS_ATTRIBUTE = 'access_attribute',
    CREATE_VALUE = 'create_value',
    EDIT_VALUE = 'edit_value',
    DELETE_VALUE = 'delete_value'
}

export enum AppPermissionsActions {
    ACCESS_LIBRARIES = 'app_access_libraries',
    CREATE_LIBRARY = 'app_create_library',
    EDIT_LIBRARY = 'app_edit_library',
    DELETE_LIBRARY = 'app_delete_library',
    ACCESS_ATTRIBUTES = 'app_access_attributes',
    CREATE_ATTRIBUTE = 'app_create_attribute',
    EDIT_ATTRIBUTE = 'app_edit_attribute',
    DELETE_ATTRIBUTE = 'app_delete_attribute',
    ACCESS_TREES = 'app_access_trees',
    CREATE_TREE = 'app_create_tree',
    EDIT_TREE = 'app_edit_tree',
    DELETE_TREE = 'app_delete_tree',
    ACCESS_FORMS = 'app_access_forms',
    CREATE_FORM = 'app_create_form',
    EDIT_FORM = 'app_edit_form',
    DELETE_FORM = 'app_delete_form',
    ACCESS_PERMISSIONS = 'app_access_permissions',
    EDIT_PERMISSION = 'app_edit_permission',
    ACCESS_NAVIGATOR = 'app_access_navigator'
}

export type PermissionsActions =
    | LibraryPermissionsActions
    | RecordPermissionsActions
    | RecordAttributePermissionsActions
    | AppPermissionsActions
    | AttributePermissionsActions;

export interface ILabeledPermissionsAction {
    label: ISystemTranslation;
    name: PermissionsActions | string;
}

export enum PermissionsRelations {
    AND = 'and',
    OR = 'or'
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
     * Tree element's library
     */
    library: string | null;

    /**
     * Tree element's ID
     */
    id: string | null;
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
