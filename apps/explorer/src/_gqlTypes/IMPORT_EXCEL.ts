// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {SheetInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: IMPORT_EXCEL
// ====================================================

export interface IMPORT_EXCEL {
    importExcel: boolean;
}

export interface IMPORT_EXCELVariables {
    file: any;
    sheets?: (SheetInput | null)[] | null;
}
