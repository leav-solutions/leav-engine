// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_VIEWS
// ====================================================

export interface GET_VIEWS_views_list {
    id: string;
    label: SystemTranslation;
}

export interface GET_VIEWS_views {
    list: GET_VIEWS_views_list[];
}

export interface GET_VIEWS {
    views: GET_VIEWS_views;
}

export interface GET_VIEWSVariables {
    library: string;
}
