/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: RecordIdentity
// ====================================================

export interface RecordIdentity_whoAmI_library_gqlNames {
  query: string;
  type: string;
}

export interface RecordIdentity_whoAmI_library {
  id: string;
  label: any | null;
  gqlNames: RecordIdentity_whoAmI_library_gqlNames;
}

export interface RecordIdentity_whoAmI_preview {
  small: string | null;
  medium: string | null;
  big: string | null;
  pages: string | null;
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
