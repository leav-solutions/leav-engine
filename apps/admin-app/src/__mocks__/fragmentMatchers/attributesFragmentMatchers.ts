// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
