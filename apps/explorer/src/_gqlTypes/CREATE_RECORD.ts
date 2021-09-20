/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CREATE_RECORD
// ====================================================

export interface CREATE_RECORD_createRecord_whoAmI_library_gqlNames {
  query: string;
  type: string;
}

export interface CREATE_RECORD_createRecord_whoAmI_library {
  id: string;
  label: any | null;
  gqlNames: CREATE_RECORD_createRecord_whoAmI_library_gqlNames;
}

export interface CREATE_RECORD_createRecord_whoAmI_preview {
  small: string | null;
  medium: string | null;
  big: string | null;
  pages: string | null;
}

export interface CREATE_RECORD_createRecord_whoAmI {
  id: string;
  label: string | null;
  color: string | null;
  library: CREATE_RECORD_createRecord_whoAmI_library;
  preview: CREATE_RECORD_createRecord_whoAmI_preview | null;
}

export interface CREATE_RECORD_createRecord {
  id: string;
  whoAmI: CREATE_RECORD_createRecord_whoAmI;
}

export interface CREATE_RECORD {
  createRecord: CREATE_RECORD_createRecord;
}

export interface CREATE_RECORDVariables {
  library: string;
}
