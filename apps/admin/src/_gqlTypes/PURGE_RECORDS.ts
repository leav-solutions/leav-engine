// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: PURGE_RECORDS
// ====================================================

export interface PURGE_RECORDS_purgeInactiveRecords {
    id: string;
}

export interface PURGE_RECORDS {
    purgeInactiveRecords: PURGE_RECORDS_purgeInactiveRecords[];
}

export interface PURGE_RECORDSVariables {
    libraryId: string;
}
