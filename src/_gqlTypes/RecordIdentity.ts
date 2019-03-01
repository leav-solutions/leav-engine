/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: RecordIdentity
// ====================================================

export interface RecordIdentity_whoAmI_library {
    id: string;
    label: any | null;
}

export interface RecordIdentity_whoAmI {
    id: string;
    library: RecordIdentity_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface RecordIdentity {
    whoAmI: RecordIdentity_whoAmI;
}
