// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_LIBRARY_PERMISSIONS_libraries_list_permissions} from '_gqlTypes/GET_LIBRARY_PERMISSIONS';
import {mockLabel} from './label';

export const mockLibrary = {
    id: 'libraryId',
    label: mockLabel('libraryLabel'),
    gqlNames: {
        query: 'libraryId',
        type: 'LibraryId'
    }
};

export const mockLibraryPermissions: GET_LIBRARY_PERMISSIONS_libraries_list_permissions = {
    access_library: true,
    access_record: true,
    create_record: true,
    edit_record: true,
    delete_record: true
};
