import {getAvailableActionsQuery} from '../../../../queries/attributes/getAvailableActionsQuery';
import {AttributeType, AttributeFormat} from '../../../../_gqlTypes/globalTypes';

export const AVAILABLE_ACTIONS_MOCK = [
    {
        request: {
            query: getAvailableActionsQuery,
            variables: {}
        },
        result: {
            data: {
                availableActions: [
                    {
                        name: 'validateFormat',
                        description: 'Check if value matches attribute format',
                        input_types: ['string', 'number', 'boolean', 'object'],
                        output_types: ['string', 'number', 'boolean', 'object'],
                        params: null
                    },
                    {
                        name: 'maskValue',
                        description: 'Mask any value by replacing with dots or empty string if no value',
                        input_types: ['string', 'number', 'boolean', 'object'],
                        output_types: ['string', 'number', 'boolean', 'object'],
                        params: null
                    }
                ]
            }
        }
    }
];

export const ONE_AVAILABLE_ACTION_MOCK = [
    {
        request: {
            query: getAvailableActionsQuery,
            variables: {}
        },
        result: {
            data: {
                availableActions: [
                    {
                        name: 'validateFormat',
                        description: 'Check if value matches attribute format',
                        input_types: ['string', 'number', 'boolean', 'object'],
                        output_types: ['string', 'number', 'boolean', 'object'],
                        params: null
                    }
                ]
            }
        }
    }
];

export const NO_AVAILABLE_ACTION_MOCK = [
    {
        request: {
            query: getAvailableActionsQuery,
            variables: {}
        },
        result: {
            data: {
                availableActions: []
            }
        }
    }
];

export const ATTRIBUTE_MOCK = {
    id: 'id',
    format: AttributeFormat.text,
    label: {en: 'Identifier', fr: 'identifiant'},
    linked_library: null,
    linked_tree: null,
    multiple_values: false,
    permissions_conf: null,
    system: true,
    type: AttributeType.simple,
    versions_conf: {
        mode: null,
        trees: [],
        versionable: false
    }
};

// params : [{
//     name: "",
//     type: "",
//     description: "",
//     required: false,
//     default_value: ""
// }]
