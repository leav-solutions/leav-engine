// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseCode, createClient} from 'graphql-ws';
import {gqlPossibleTypes, useRedirectToLogin} from '@leav/ui';
import {ApolloClient, from, HttpLink, InMemoryCache, type Observable, type ServerError, split} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import {type NextLink, type Operation} from '@apollo/client/link/core';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {getMainDefinition} from '@apollo/client/utilities';
import {API_ENDPOINT, ORIGIN_URL, WS_URL} from '../../constants';

export const useInitApollo = (
    unauthorizedHandler: (forward: NextLink, operation: Operation) => Observable<unknown>,
) => {
    const {redirectToLogin} = useRedirectToLogin();
    const errorLink = onError(({graphQLErrors, networkError, operation, forward, response}) => {
        if (
            (networkError as ServerError)?.statusCode === 401 ||
            (graphQLErrors ?? [])?.some(err => err?.extensions?.code === 'UNAUTHENTICATED')
        ) {
            return unauthorizedHandler(forward, operation);
        }

        graphQLErrors?.forEach(({message, locations, path}) => {
            console.warn(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
        });

        if (networkError) {
            // Check if the error response is JSON
            try {
                JSON.parse(networkError.message);
            } catch (e) {
                // If not, replace a parsing error message with a real one
                // TODO: get lang from context
                networkError.message = 'Unable to connect to server. Please check your Internet connection.';
            }
        }
    });

    const wsLink = new GraphQLWsLink(
        createClient({
            url: `${WS_URL}/${API_ENDPOINT}`,
            retryAttempts: Infinity,
            shouldRetry: err => {
                if (err instanceof CloseEvent && err.code === CloseCode.Forbidden) {
                    console.info('WebSocket connection forbidden, redirect to login...');
                    redirectToLogin();
                    return false;
                }
                return true;
            },
        }),
    );

    // TODO: get lang from context
    const httpLink = new HttpLink({
        uri: (operation: Operation) => `${ORIGIN_URL}/${API_ENDPOINT}?lang=fr&opName=${operation.operationName}`,
    });

    const splitLink = split(
        ({query}) => {
            const definition = getMainDefinition(query);
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
        },
        wsLink,
        httpLink,
    );

    const client = new ApolloClient({
        link: from([errorLink, splitLink]),
        connectToDevTools: import.meta.env.DEV,
        cache: new InMemoryCache({
            possibleTypes: gqlPossibleTypes,
        }),
    });

    return {client};
};
