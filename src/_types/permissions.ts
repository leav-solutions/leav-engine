export enum PermissionTypes {
    RECORD = 'record',
    ATTRIBUTE = 'attribute',
    ADMIN = 'admin',
    LIBRARY = 'library'
}

export enum LibraryPermissionsActions {
    ACCESS = 'access',
    CREATE = 'create',
    EDIT = 'edit',
    DELETE = 'delete'
}

export enum RecordPermissionsActions {
    ACCESS = 'access',
    CREATE = 'create',
    EDIT = 'edit',
    DELETE = 'delete'
}

export enum AttributePermissionsActions {
    ACCESS_ATTRIBUTE = 'access_attribute',
    CREATE_VALUE = 'create_value',
    EDIT_VALUE = 'edit_value',
    DELETE_VALUE = 'delete_value'
}

export enum AdminPermissionsActions {
    ACCESS_LIBRARIES = 'admin_access_libraries',
    CREATE_LIBRARY = 'admin_create_library',
    EDIT_LIBRARY = 'admin_edit_library',
    DELETE_LIBRARY = 'admin_delete_library',
    ACCESS_ATTRIBUTES = 'admin_access_attributes',
    CREATE_ATTRIBUTE = 'admin_create_attribute',
    EDIT_ATTRIBUTE = 'admin_edit_attribute',
    DELETE_ATTRIBUTE = 'admin_delete_attribute',
    ACCESS_TREES = 'admin_access_trees',
    CREATE_TREE = 'admin_create_tree',
    EDIT_TREE = 'admin_edit_tree',
    DELETE_TREE = 'admin_delete_tree',
    ACCESS_FORMS = 'admin_access_forms',
    CREATE_FORM = 'admin_create_form',
    EDIT_FORM = 'admin_edit_form',
    DELETE_FORM = 'admin_delete_form',
    ACCESS_PERMISSIONS = 'admin_access_permissions',
    EDIT_PERMISSION = 'admin_edit_permission',
    ACCESS_NAVIGATOR = 'admin_access_navigator'
}

export type PermissionsActions =
    | LibraryPermissionsActions
    | RecordPermissionsActions
    | AttributePermissionsActions
    | AdminPermissionsActions;

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
    id: string | number | null;
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
