import {CloseCode, createClient} from 'graphql-ws';
import {gqlPossibleTypes, useRedirectToLogin} from '@leav/ui';
import {ApolloClient, from, HttpLink, InMemoryCache, type Observable, type ServerError, split} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import {ApolloLink, type NextLink, type Operation} from '@apollo/client/link/core';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {getMainDefinition} from '@apollo/client/utilities';
import {API_ENDPOINT, ORIGIN_URL, WS_URL} from '../../constants';

// eslint-disable-next-line import/extensions
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import {i18n} from '../translation/initI18n';

export const useInitApollo = (
    unauthorizedHandler: (forward: NextLink, operation: Operation) => Observable<unknown>,
) => {
    const {checkAuthOrRedirectToLogin} = useRedirectToLogin();
    const errorLink = onError(({graphQLErrors, networkError, operation, forward}) => {
        if (
            (networkError as ServerError)?.statusCode === 401 ||
            (graphQLErrors ?? [])?.some(err => err?.extensions?.code === 'UNAUTHENTICATED')
        ) {
            console.info('Authentication error detected, redirecting to login...');
            return unauthorizedHandler(forward, operation);
        }

        graphQLErrors?.forEach(({message, locations, path}) => {
            console.warn(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
        });

        if (networkError) {
            // Check if the error response is JSON
            try {
                JSON.parse(networkError.message);
            } catch {
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
                    console.info('WebSocket connection forbidden, check auth or redirecting to login...');
                    checkAuthOrRedirectToLogin();
                }
                return true;
            },
        }),
    );

    const splitLink = split(({query}) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    }, wsLink);

    // set uri in operation context because it is the only way for createUploadLink to have custom url by operation
    const _setOperationUri = new ApolloLink((operation, forward) => {
        operation.setContext({
            ...operation.getContext(),
            uri: `${ORIGIN_URL}/${API_ENDPOINT}?lang=${i18n.language}&opName=${operation.operationName}`,
        });

        return forward(operation);
    });

    const client = new ApolloClient({
        link: from([
            errorLink,
            splitLink,
            _setOperationUri,
            createUploadLink({
                headers: {
                    'Apollo-Require-Preflight': 'true', // Required to get upload working with Apollo Server v4+
                },
            }),
        ]),
        devtools: {enabled: import.meta.env.DEV},
        cache: new InMemoryCache({
            possibleTypes: gqlPossibleTypes,
        }),
    });

    return {client};
};
