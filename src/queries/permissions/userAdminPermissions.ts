import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {ADMIN_PERMISSIONS} from '../../_gqlTypes/ADMIN_PERMISSIONS';

export const adminPermissionsQuery = gql`
    query ADMIN_PERMISSIONS {
        adminPermissions @client {
            admin_access_attributes
            admin_access_libraries
            admin_access_permissions
            admin_access_trees
            admin_create_attribute
            admin_create_library
            admin_create_tree
            admin_delete_attribute
            admin_delete_library
            admin_delete_tree
            admin_edit_attribute
            admin_edit_library
            admin_edit_permission
            admin_edit_tree
        }
    }
`;

export class AdminPermissionsQuery extends Query<ADMIN_PERMISSIONS> {}
