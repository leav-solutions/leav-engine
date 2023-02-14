// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior, FileType} from './globalTypes';

// ====================================================
// GraphQL mutation operation: CREATE_DIRECTORY
// ====================================================

export interface CREATE_DIRECTORY_createDirectory_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface CREATE_DIRECTORY_createDirectory_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: any | null;
    gqlNames: CREATE_DIRECTORY_createDirectory_whoAmI_library_gqlNames;
}

export interface CREATE_DIRECTORY_createDirectory_whoAmI_preview_file_library {
    id: string;
}

export interface CREATE_DIRECTORY_createDirectory_whoAmI_preview_file {
    id: string;
    file_type: FileType;
    library: CREATE_DIRECTORY_createDirectory_whoAmI_preview_file_library;
}

export interface CREATE_DIRECTORY_createDirectory_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
    original: string;
    file: CREATE_DIRECTORY_createDirectory_whoAmI_preview_file | null;
}

export interface CREATE_DIRECTORY_createDirectory_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: CREATE_DIRECTORY_createDirectory_whoAmI_library;
    preview: CREATE_DIRECTORY_createDirectory_whoAmI_preview | null;
}

export interface CREATE_DIRECTORY_createDirectory {
    id: string;
    whoAmI: CREATE_DIRECTORY_createDirectory_whoAmI;
}

export interface CREATE_DIRECTORY {
    createDirectory: CREATE_DIRECTORY_createDirectory;
}

export interface CREATE_DIRECTORYVariables {
    library: string;
    nodeId: string;
    name: string;
}
