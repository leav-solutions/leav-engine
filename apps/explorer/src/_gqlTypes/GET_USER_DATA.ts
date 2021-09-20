/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_USER_DATA
// ====================================================

export interface GET_USER_DATA_userData {
  global: boolean;
  data: any | null;
}

export interface GET_USER_DATA {
  userData: GET_USER_DATA_userData;
}

export interface GET_USER_DATAVariables {
  keys: string[];
  global?: boolean | null;
}
