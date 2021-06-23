// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PossibleTypesMap} from '@apollo/client';
import {IntrospectionResultData} from 'apollo-cache-inmemory';
import {useCallback, useEffect, useState} from 'react';

export interface IUseGraphqlPossibleTypes {
    loading: boolean;
    error: string;
    possibleTypes: PossibleTypesMap;
}

export default function (url: string, token: string): IUseGraphqlPossibleTypes {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>();
    const [possibleTypes, setPossibleTypes] = useState<PossibleTypesMap>();

    const _fetchPossibleTypes = useCallback(async () => {
        // If the server sends a 401, resData will not contain the schema.
        // The try and catch allows to handle the situation.
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token
                },
                body: JSON.stringify({
                    variables: {},
                    query: `
                  {
                    __schema {
                      types {
                        kind
                        name
                        possibleTypes {
                          name
                        }
                      }
                    }
                  }
                `
                })
            });

            const resData: IntrospectionResultData = (await res.json()).data;
            const fetchedPossibleTypes: PossibleTypesMap = resData.__schema.types.reduce((allTypes, type) => {
                if (!type.possibleTypes) {
                    return allTypes;
                }

                return {
                    ...allTypes,
                    [type.name]: type.possibleTypes.map(possibleType => possibleType.name)
                };
            }, {});

            setIsLoading(false);
            setPossibleTypes(fetchedPossibleTypes);
        } catch (err) {
            setIsLoading(false);
            setError(String(err));
        }
    }, [url, token]);

    useEffect(() => {
        _fetchPossibleTypes();
    }, [_fetchPossibleTypes]);

    return {
        loading: isLoading,
        error,
        possibleTypes
    };
}
