/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_LIBRARY_PERMISSIONS
// ====================================================

export interface GET_LIBRARY_PERMISSIONS_libraries_list_permissions {
    access_library: boolean;
    access_record: boolean;
    create_record: boolean;
    edit_record: boolean;
    delete_record: boolean;
}

export interface GET_LIBRARY_PERMISSIONS_libraries_list {
    permissions: GET_LIBRARY_PERMISSIONS_libraries_list_permissions | null;
}

export interface GET_LIBRARY_PERMISSIONS_libraries {
    list: GET_LIBRARY_PERMISSIONS_libraries_list[];
}

export interface GET_LIBRARY_PERMISSIONS {
    libraries: GET_LIBRARY_PERMISSIONS_libraries | null;
}

export interface GET_LIBRARY_PERMISSIONSVariables {
    libraryId?: string[] | null;
}
