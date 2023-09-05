// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {RecordFilterInput} from './globalTypes';

// ====================================================
// GraphQL query operation: EXPORT
// ====================================================

export interface EXPORT {
    export: string;
}

export interface EXPORTVariables {
    library: string;
    attributes?: string[] | null;
    filters?: RecordFilterInput[] | null;
}
