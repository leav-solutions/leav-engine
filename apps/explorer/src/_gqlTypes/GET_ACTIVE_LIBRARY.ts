/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_ACTIVE_LIBRARY
// ====================================================

export interface GET_ACTIVE_LIBRARY_activeLib_gql {
  searchableFields: string;
  query: string;
  type: string;
}

export interface GET_ACTIVE_LIBRARY_activeLib {
  id: string;
  name: string;
  filter: string;
  gql: GET_ACTIVE_LIBRARY_activeLib_gql;
}

export interface GET_ACTIVE_LIBRARY {
  activeLib: GET_ACTIVE_LIBRARY_activeLib | null;
}
