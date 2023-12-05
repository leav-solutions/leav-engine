// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    HttpLink,
    InMemoryCache,
    Observable,
    ServerError,
    split
} from '@apollo/client';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {getMainDefinition} from '@apollo/client/utilities';
import {onError} from '@apollo/link-error';
import {gqlPossibleTypes, useRefreshToken} from '@leav/ui';
import {message} from 'antd';
import fetch from 'cross-fetch';
import {createClient} from 'graphql-ws';
import {ReactNode, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {API_ENDPOINT, APPS_ENDPOINT, LOGIN_ENDPOINT, ORIGIN_URL, WS_URL} from '../../constants';

interface IApolloHandlerProps {
    children: ReactNode;
}

const _redirectToLogin = () =>
    window.location.replace(`${ORIGIN_URL}/${APPS_ENDPOINT}/${LOGIN_ENDPOINT}/?dest=${window.location.pathname}`);

function ApolloHandler({children}: IApolloHandlerProps): JSX.Element {
    const {t} = useTranslation();
    const {refreshToken} = useRefreshToken();

    const wsLink = useMemo(() => {
        return new GraphQLWsLink(
            createClient({
                url: `${WS_URL}/${API_ENDPOINT}`,
                shouldRetry: () => true
            })
        );
    }, []);

    // This function will catch the errors from the exchange between Apollo Client and the server.
    const _handleApolloError = onError(({graphQLErrors, networkError, operation, forward}) => {
        if (graphQLErrors) {
            graphQLErrors.map(({message: origMessage, locations, path}) => {
                const errorMessage = `[GraphQL error]: Message: ${origMessage}, Location: ${locations}, Path: ${path}`;
                return errorMessage;
            });
        }

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
                        await refreshToken();

                        // Retry last failed request
                        forward(operation).subscribe({
                            next: observer.next.bind(observer),
                            error: observer.error.bind(observer),
                            complete: observer.complete.bind(observer)
                        });
                    } catch (err) {
                        _redirectToLogin();
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
            (_handleApolloError as unknown) as ApolloLink,
            splitLink,
            new HttpLink({
                uri: `${ORIGIN_URL}/${API_ENDPOINT}`,
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
}

export default ApolloHandler;
