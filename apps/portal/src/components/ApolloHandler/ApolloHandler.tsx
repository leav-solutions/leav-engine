// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    HttpLink,
    InMemoryCache,
    Observable,
    type Operation,
    type ServerError,
    split
} from '@apollo/client';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {getMainDefinition} from '@apollo/client/utilities';
import {onError} from '@apollo/client/link/error';
import {gqlPossibleTypes, useRedirectToLogin} from '@leav/ui';
import {message} from 'antd';
import fetch from 'cross-fetch';
import {createClient} from 'graphql-ws';
import {type FunctionComponent, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {API_ENDPOINT, ORIGIN_URL, WS_URL} from '../../constants';

const ApolloHandler: FunctionComponent = ({children}) => {
    const {t} = useTranslation();
    const {redirectToLogin} = useRedirectToLogin();

    const wsLink = useMemo(
        () =>
            new GraphQLWsLink(
                createClient({
                    url: `${WS_URL}/${API_ENDPOINT}`,
                    retryAttempts: Infinity,
                    shouldRetry: () => true
                })
            ),
        []
    );

    // This function will catch the errors from the exchange between Apollo Client and the server.
    const errorLink = onError(({graphQLErrors, networkError, operation, forward}) => {
        graphQLErrors?.forEach(({message: origMessage, locations, path}) => {
            console.warn(`[GraphQL error]: Message: ${origMessage}, Location: ${locations}, Path: ${path}`);
        });

        let errorContent: string = t('error.error_occurred');
        if (networkError) {
            errorContent = t('error.network_error_occurred');
        }

        if (
            (networkError as ServerError)?.statusCode === 401 ||
            (graphQLErrors ?? []).some(err => err.extensions.code === 'UNAUTHENTICATED')
        ) {
            return new Observable(observer => {
                (async () => {
                    try {
                        redirectToLogin();

                        // Retry last failed request
                        forward(operation).subscribe({
                            next: observer.next.bind(observer),
                            error: observer.error.bind(observer),
                            complete: observer.complete.bind(observer)
                        });
                    } catch (err) {
                        observer.error(err);
                    }
                })();
            });
        }

        message.error(errorContent);
    });

    const splitLink = split(({query}) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    }, wsLink);

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            errorLink,
            splitLink,
            new HttpLink({
                uri: (operation: Operation) => `${ORIGIN_URL}/${API_ENDPOINT}?&opName=${operation.operationName}`,
                fetch
            })
        ]),
        cache: new InMemoryCache({
            typePolicies: {
                Application: {
                    fields: {
                        permissions: {
                            merge(existing, incoming) {
                                return {...existing, ...incoming};
                            }
                        }
                    }
                }
            },
            possibleTypes: gqlPossibleTypes
        })
    });

    return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
};

export default ApolloHandler;
