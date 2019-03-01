/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ADMIN_PERMISSIONS
// ====================================================

export interface ADMIN_PERMISSIONS_adminPermissions {
    admin_access_attributes: boolean;
    admin_access_libraries: boolean;
    admin_access_permissions: boolean;
    admin_access_trees: boolean;
    admin_create_attribute: boolean;
    admin_create_library: boolean;
    admin_create_tree: boolean;
    admin_delete_attribute: boolean;
    admin_delete_library: boolean;
    admin_delete_tree: boolean;
    admin_edit_attribute: boolean;
    admin_edit_library: boolean;
    admin_edit_permission: boolean;
    admin_edit_tree: boolean;
}

export interface ADMIN_PERMISSIONS {
    adminPermissions: ADMIN_PERMISSIONS_adminPermissions | null;
}
