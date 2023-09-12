// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior} from './globalTypes';

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
    label: SystemTranslation | null;
    gqlNames: CREATE_DIRECTORY_createDirectory_whoAmI_library_gqlNames;
}

export interface CREATE_DIRECTORY_createDirectory_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: CREATE_DIRECTORY_createDirectory_whoAmI_library;
    preview: Preview | null;
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
