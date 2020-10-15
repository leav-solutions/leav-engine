/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ValueInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_VALUE
// ====================================================

export interface SAVE_VALUE_saveValue {
    id_value: string | null;
    value: Any | null;
    raw_value: Any | null;
    attribute: string | null;
}

export interface SAVE_VALUE {
    /**
     * Save one value
     */
    saveValue: SAVE_VALUE_saveValue;
}

export interface SAVE_VALUEVariables {
    library: string;
    recordId: string;
    attribute: string;
    value: ValueInput;
}
