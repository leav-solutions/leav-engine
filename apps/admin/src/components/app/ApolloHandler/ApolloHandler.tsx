import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    defaultDataIdFromObject,
    HttpLink,
    InMemoryCache,
    Observable,
    type Operation,
    type PossibleTypesMap,
    type ServerError,
    split,
} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {getMainDefinition} from '@apollo/client/utilities';
import fetch from 'cross-fetch';
import {CloseCode, createClient} from 'graphql-ws';
import useRedirectToLogin from '../../../hooks/useRedirectToLogin';
import {type FunctionComponent, type PropsWithChildren} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {endMutation, startMutation} from '../../../reduxStore/mutationsWatcher/mutationsWatcher';
import * as yup from 'yup';
import {API_ENDPOINT, ORIGIN_URL, UNAUTHENTICATED, WS_URL} from '../../../constants';

const gqlPossibleTypes: PossibleTypesMap = {
    Attribute: ['StandardAttribute', 'LinkAttribute', 'TreeAttribute'],
    StandardValuesListConf: ['StandardStringValuesListConf', 'StandardDateRangeValuesListConf'],
    GenericValue: ['Value', 'LinkValue', 'TreeValue'],
};

const ApolloHandler: FunctionComponent<PropsWithChildren> = ({children}) => {
    const dispatch = useDispatch();
    const {t, i18n} = useTranslation();
    const {checkAuthOrRedirectToLogin} = useRedirectToLogin();

    const errorLink = onError(({graphQLErrors, networkError, operation, forward}) => {
        if (
            (networkError as ServerError)?.statusCode === 401 ||
            (graphQLErrors ?? []).some(err => err.extensions.code === UNAUTHENTICATED)
        ) {
            return new Observable(observer => {
                (async () => {
                    try {
                        await checkAuthOrRedirectToLogin();

                        // Retry last failed request
                        forward(operation).subscribe({
                            next: observer.next.bind(observer),
                            error: observer.error.bind(observer),
                            complete: observer.complete.bind(observer),
                        });
                    } catch (err) {
                        observer.error(err);
                    }
                })();
            });
        }

        graphQLErrors?.forEach(({message, locations, path}) => {
            console.warn(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
        });

        const isMutation = operation.query.definitions.some(
            def => def.kind === 'OperationDefinition' && def.operation === 'mutation',
        );
        if (isMutation) {
            dispatch(endMutation());
        }
    });

    const _mutationsWatcherLink = new ApolloLink((operation, forward) => {
        const isMutation = operation.query.definitions.some(
            def => def.kind === 'OperationDefinition' && def.operation === 'mutation',
        );
        operation.setContext({isMutation});

        if (isMutation) {
            dispatch(startMutation());
        }

        return forward(operation).map(data => {
            if (operation.getContext().isMutation) {
                dispatch(endMutation());
            }

            return data;
        });
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

    const splitLink = split(
        ({query}) => {
            const definition = getMainDefinition(query);
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
        },
        wsLink as unknown as ApolloLink,
    );

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            errorLink,
            splitLink,
            _mutationsWatcherLink,
            new HttpLink({
                uri: (operation: Operation) =>
                    `${ORIGIN_URL}/${API_ENDPOINT}?lang=${i18n.language}&opName=${operation.operationName}`,
                fetch,
            }),
        ]),
        devtools: {enabled: process.env.NODE_ENV === 'development'},
        cache: new InMemoryCache({
            // For records, ID might sometimes be in the _id property to avoid messing up
            // with the ID attribute (eg. in the getRecordPropertiesQuery).
            // Thus, we have to force Apollo to use the _id field for cache key.
            dataIdFromObject(responseObject) {
                // If it's not a record, just use regular caching
                if (!responseObject._id && !responseObject.id) {
                    return defaultDataIdFromObject(responseObject);
                }

                const idValue = responseObject._id || responseObject.id;
                return `${responseObject.__typename}:${String(idValue)}`;
            },
            typePolicies: {
                Query: {
                    fields: {
                        attributes: {
                            merge: true,
                        },
                    },
                },
                RecordIdentity: {
                    keyFields: ['id', 'library', ['id']],
                },
                Library: {
                    fields: {
                        attributes: {
                            merge(existing, incoming) {
                                return incoming;
                            },
                        },
                    },
                },
                VersionProfile: {
                    fields: {
                        linkedAttributes: {
                            merge(existing, incoming) {
                                return incoming;
                            },
                        },
                    },
                },
            },
            possibleTypes: gqlPossibleTypes,
        }),
    });

    // Load yup messages translations
    yup.setLocale({
        string: {matches: t('admin.validation_errors.matches')},
        array: {
            min: t('admin.validation_errors.min'),
        },
        mixed: {
            required: t('admin.validation_errors.required'),
        },
    });

    return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
};

export default ApolloHandler;
