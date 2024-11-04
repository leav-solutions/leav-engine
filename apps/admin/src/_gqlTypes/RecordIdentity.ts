// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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

export interface RecordIdentity_whoAmI {
    id: string;
    library: RecordIdentity_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface RecordIdentity {
    whoAmI: RecordIdentity_whoAmI;
}
