// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: RecordIdentity
// ====================================================

export interface RecordIdentity_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface RecordIdentity_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
}

export interface RecordIdentity_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: RecordIdentity_whoAmI_library;
    preview: RecordIdentity_whoAmI_preview | null;
}

export interface RecordIdentity {
    id: string;
    whoAmI: RecordIdentity_whoAmI;
}
