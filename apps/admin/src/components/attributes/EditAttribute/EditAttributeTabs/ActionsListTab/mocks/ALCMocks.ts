import {getAvailableActionsQuery} from '../../../../../../queries/attributes/getAvailableActionsQuery';

export const AVAILABLE_ACTIONS_MOCK = [
    {
        request: {
            query: getAvailableActionsQuery,
            variables: {},
        },
        result: {
            data: {
                availableActions: [
                    {
                        __typename: 'Action',
                        id: 'validateFormat',
                        name: 'Validate Format',
                        description: 'Check if value matches attribute format',
                        input_types: ['string', 'number', 'boolean', 'object'],
                        output_types: ['string', 'number', 'boolean', 'object'],
                        params: null,
                    },
                    {
                        __typename: 'Action',
                        id: 'maskValue',
                        name: 'Mask Value',
                        description: 'Mask any value by replacing with dots or empty string if no value',
                        input_types: ['string', 'number', 'boolean', 'object'],
                        output_types: ['string', 'number', 'boolean', 'object'],
                        params: null,
                    },
                ],
            },
        },
    },
];

export const ONE_AVAILABLE_ACTION_MOCK = [
    {
        request: {
            query: getAvailableActionsQuery,
            variables: {},
        },
        result: {
            data: {
                availableActions: [
                    {
                        __typename: 'Action',
                        id: 'validateFormat',
                        name: 'validateFormat',
                        description: 'Check if value matches attribute format',
                        input_types: ['string', 'number', 'boolean', 'object'],
                        output_types: ['string', 'number', 'boolean', 'object'],
                        params: null,
                    },
                ],
            },
        },
    },
];

export const NO_AVAILABLE_ACTION_MOCK = [
    {
        request: {
            query: getAvailableActionsQuery,
            variables: {},
        },
        result: {
            data: {
                availableActions: [],
            },
        },
    },
];
