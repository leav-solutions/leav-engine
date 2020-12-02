// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {ValueInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: saveValue
// ====================================================

export interface saveValue_saveValue {
    id_value: string | null;
    value: string | null;
}

export interface saveValue {
    /**
     * Save one value
     */
    saveValue: saveValue_saveValue;
}

export interface saveValueVariables {
    library: string;
    recordId: string;
    attribute: string;
    value?: ValueInput | null;
}
