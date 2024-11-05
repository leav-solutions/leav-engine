// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AvailableLanguage} from './globalTypes';

// ====================================================
// GraphQL query operation: ROOT_SELECTOR_QUERY
// ====================================================

export interface ROOT_SELECTOR_QUERY_libraries_list {
    id: string;
    label: SystemTranslation | null;
}

export interface ROOT_SELECTOR_QUERY_libraries {
    list: ROOT_SELECTOR_QUERY_libraries_list[];
}

export interface ROOT_SELECTOR_QUERY {
    libraries: ROOT_SELECTOR_QUERY_libraries | null;
}

export interface ROOT_SELECTOR_QUERYVariables {
    lang?: AvailableLanguage[] | null;
}
