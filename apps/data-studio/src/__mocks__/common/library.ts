import {type GET_LIBRARY_PERMISSIONS_libraries_list_permissions} from '../../_gqlTypes/GET_LIBRARY_PERMISSIONS';
import {LibraryBehavior} from '../../_gqlTypes';
import {mockLabel} from './label';

export const mockLibrary = {
    id: 'libraryId',
    behavior: LibraryBehavior.standard,
    label: mockLabel('libraryLabel'),
    icon: null,
    previewsSettings: null,
};

export const mockLibraryPermissions: GET_LIBRARY_PERMISSIONS_libraries_list_permissions = {
    access_library: true,
    access_record: true,
    create_record: true,
    edit_record: true,
    delete_record: true,
};
