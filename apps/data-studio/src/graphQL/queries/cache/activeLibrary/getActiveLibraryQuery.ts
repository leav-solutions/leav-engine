import {gql} from '@apollo/client';
import {
    type GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes,
    type GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees,
    type GET_LIBRARY_DETAIL_EXTENDED_libraries_list_permissions,
} from '../../../../_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {type LibraryBehavior} from '../../../../_gqlTypes';

export interface IActiveLibrary {
    id: string;
    name: string;
    behavior: LibraryBehavior;
    attributes: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes[];
    trees: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_linkedTrees[];
    permissions: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_permissions;
}

export interface IGetActiveLibrary {
    activeLib: IActiveLibrary;
}

export const getActiveLibrary = gql`
    query GET_ACTIVE_LIBRARY {
        activeLib @client {
            id @client
            name @client
            behavior @client
            attributes @client
            trees
            permissions @client {
                access_library @client
                access_record @client
                create_record @client
                edit_record @client
                delete_record @client
            }
        }
    }
`;
