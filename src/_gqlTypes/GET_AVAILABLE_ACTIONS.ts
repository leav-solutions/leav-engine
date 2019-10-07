/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AvailableActionsName, ActionIOTypes} from './globalTypes';

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
    name: AvailableActionsName;
    description: string | null;
    input_types: (ActionIOTypes | null)[];
    output_types: (ActionIOTypes | null)[];
    params: (GET_AVAILABLE_ACTIONS_availableActions_params | null)[] | null;
}

export interface GET_AVAILABLE_ACTIONS {
    availableActions: GET_AVAILABLE_ACTIONS_availableActions[] | null;
}
