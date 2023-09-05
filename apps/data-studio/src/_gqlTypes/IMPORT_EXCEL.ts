/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {SheetInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: IMPORT_EXCEL
// ====================================================

export interface IMPORT_EXCEL {
    importExcel: string;
}

export interface IMPORT_EXCELVariables {
    file: Upload;
    sheets?: (SheetInput | null)[] | null;
    startAt?: number | null;
}
