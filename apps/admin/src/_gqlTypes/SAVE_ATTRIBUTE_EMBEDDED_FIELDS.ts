// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AttributeInput, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_ATTRIBUTE_EMBEDDED_FIELDS
// ====================================================

export interface SAVE_ATTRIBUTE_EMBEDDED_FIELDS_saveAttribute {
    id: string;
    label: SystemTranslation | null;
    format: AttributeFormat | null;
}

export interface SAVE_ATTRIBUTE_EMBEDDED_FIELDS {
    saveAttribute: SAVE_ATTRIBUTE_EMBEDDED_FIELDS_saveAttribute;
}

export interface SAVE_ATTRIBUTE_EMBEDDED_FIELDSVariables {
    attribute?: AttributeInput | null;
}
