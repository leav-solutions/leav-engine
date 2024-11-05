// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_ALL_PLUGINS
// ====================================================

export interface GET_ALL_PLUGINS_plugins {
    name: string;
    description: string | null;
    version: string | null;
    author: string | null;
}

export interface GET_ALL_PLUGINS {
    plugins: GET_ALL_PLUGINS_plugins[];
}
