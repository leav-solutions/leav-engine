// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ActionIOTypes} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_AVAILABLE_ACTIONS
// ====================================================

export interface GET_AVAILABLE_ACTIONS_availableActions_params {
    name: string;
    type: string;
    description: string | null;
    required: boolean | null;
    default_value: string | null;
}

export interface GET_AVAILABLE_ACTIONS_availableActions {
    id: string;
    name: string;
    description: string | null;
    input_types: ActionIOTypes[];
    output_types: ActionIOTypes[];
    params: GET_AVAILABLE_ACTIONS_availableActions_params[] | null;
}

export interface GET_AVAILABLE_ACTIONS {
    availableActions: GET_AVAILABLE_ACTIONS_availableActions[] | null;
}
