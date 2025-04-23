// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, PropsWithChildren} from 'react';
import {gqlPossibleTypes, useRedirectToLogin} from '@leav/ui';
import {useTranslation} from 'react-i18next';
import {
    ApolloClient,
    ApolloProvider,
    from,
    HttpLink,
    InMemoryCache,
    Observable,
    ServerError,
    split
} from '@apollo/client';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {getMainDefinition} from '@apollo/client/utilities';
import {onError} from '@apollo/client/link/error';
import {createClient} from 'graphql-ws';
import {API_ENDPOINT, ORIGIN_URL, WS_URL} from '../../constants';

export const ApolloHandler: FunctionComponent<PropsWithChildren<{}>> = ({children}) => {
    const {t, i18n} = useTranslation();
    const {redirectToLogin} = useRedirectToLogin();

    // This function will catch the errors from the exchange between Apollo Client and the server.
    const errorLink = onError(({graphQLErrors, networkError, operation, forward, response}) => {
        if (
            (networkError as ServerError)?.statusCode === 401 ||
            (graphQLErrors ?? [])?.some(err => err?.extensions?.code === 'UNAUTHENTICATED')
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

        if (graphQLErrors && response?.data === null) {
            graphQLErrors.map(
                ({message, locations, path}) =>
                    `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
        }

        if (networkError) {
            // Check if the error response is JSON
            try {
                JSON.parse(networkError.message);
            } catch (e) {
                // If not, replace a parsing error message with a real one
                networkError.message = t('error.network_error_occured_details');
            }
        }
    });

    const wsLink = new GraphQLWsLink(
        createClient({
            url: `${WS_URL}/${API_ENDPOINT}`
        })
    );

    const httpLink = new HttpLink({
        uri: `${ORIGIN_URL}/${API_ENDPOINT}?lang=${i18n.language}`
    });

    const splitLink = split(
        ({query}) => {
            const definition = getMainDefinition(query);
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
        },
        wsLink,
        httpLink
    );

    const gqlClient = new ApolloClient({
        link: from([errorLink, splitLink]),
        connectToDevTools: import.meta.env.DEV,
        cache: new InMemoryCache({
            possibleTypes: gqlPossibleTypes
        })
    });

    return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
};
