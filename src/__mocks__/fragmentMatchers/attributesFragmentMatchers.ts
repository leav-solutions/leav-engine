import {IntrospectionFragmentMatcher} from 'apollo-cache-inmemory';

export const attributesFragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: {
        __schema: {
            types: [
                {
                    kind: 'INTERFACE',
                    name: 'Attribute',
                    possibleTypes: [
                        {
                            name: 'StandardAttribute'
                        },
                        {
                            name: 'LinkAttribute'
                        },
                        {
                            name: 'TreeAttribute'
                        }
                    ]
                }
            ]
        }
    }
});
