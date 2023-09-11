// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL fragment: RecordIdentity
// ====================================================

export interface RecordIdentity_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface RecordIdentity_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: RecordIdentity_whoAmI_library_gqlNames;
}

export interface RecordIdentity_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: RecordIdentity_whoAmI_library;
    preview: Preview | null;
}

export interface RecordIdentity {
    id: string;
    whoAmI: RecordIdentity_whoAmI;
}
