// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    defaultDataIdFromObject,
    HttpLink,
    InMemoryCache,
    Observable,
    PossibleTypesMap,
    ServerError,
    split
} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {getMainDefinition} from '@apollo/client/utilities';
import fetch from 'cross-fetch';
import {createClient} from 'graphql-ws';
import useRefreshToken from 'hooks/useRefreshToken';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {addMessage, MessagesTypes} from 'reduxStore/messages/messages';
import {endMutation, startMutation} from 'reduxStore/mutationsWatcher/mutationsWatcher';
import {SemanticICONS} from 'semantic-ui-react';
import * as yup from 'yup';
import {ErrorTypes} from '_types/errors';
import {API_ENDPOINT, APPS_ENDPOINT, LOGIN_ENDPOINT, ORIGIN_URL, UNAUTHENTICATED, WS_URL} from '../../../constants';

interface IApolloHandlerProps {
    children: ReactNode;
}

const _redirectToLogin = () =>
    window.location.replace(`${ORIGIN_URL}/${APPS_ENDPOINT}/${LOGIN_ENDPOINT}/?dest=${window.location.pathname}`);

const gqlPossibleTypes: PossibleTypesMap = {
    Attribute: ['StandardAttribute', 'LinkAttribute', 'TreeAttribute'],
    StandardValuesListConf: ['StandardStringValuesListConf', 'StandardDateRangeValuesListConf'],
    GenericValue: ['Value', 'LinkValue', 'TreeValue']
};

const ApolloHandler = ({children}: IApolloHandlerProps): JSX.Element => {
    const dispatch = useDispatch();
    const {t, i18n} = useTranslation();
    const {refreshToken} = useRefreshToken();

    const _handleApolloError = onError(({graphQLErrors, networkError, operation, forward}) => {
        let title: string;
        let content: string;
        let icon: SemanticICONS;
        const isMutation = operation.query.definitions.some(
            def => def.kind === 'OperationDefinition' && def.operation === 'mutation'
        );

        if (
            (networkError as ServerError)?.statusCode === 401 ||
            (graphQLErrors ?? []).some(err => err.extensions.code === UNAUTHENTICATED)
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

        if (graphQLErrors) {
            graphQLErrors.map(graphqlError => {
                const {message, extensions} = graphqlError;

                title = t(`errors.${extensions?.code ?? ErrorTypes.PERMISSION_ERROR}`);
                switch (extensions?.code) {
                    case ErrorTypes.VALIDATION_ERROR:
                        content = message !== 'Validation error' ? message : '';
                        break;
                    case ErrorTypes.PERMISSION_ERROR:
                        content = '';
                        icon = 'frown outline';
                        break;
                    case ErrorTypes.INTERNAL_ERROR:
                    default:
                        content = message;
                        break;
                }
            });
        } else if (networkError) {
            title = t('errors.network_error');
            icon = 'plug';
        }

        if (isMutation) {
            dispatch(endMutation());
        }

        dispatch(
            addMessage({
                type: MessagesTypes.ERROR,
                title,
                content,
                icon
            })
        );
    });

    const _mutationsWatcherLink = new ApolloLink((operation, forward) => {
        const isMutation = operation.query.definitions.some(
            def => def.kind === 'OperationDefinition' && def.operation === 'mutation'
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
            url: `${WS_URL}/${API_ENDPOINT}`
        })
    );

    const splitLink = split(({query}) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    }, (wsLink as unknown) as ApolloLink);

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            _handleApolloError,
            splitLink,
            _mutationsWatcherLink,
            new HttpLink({
                uri: `${ORIGIN_URL}/${API_ENDPOINT}?lang=${i18n.language}`,
                fetch
            })
        ]),
        connectToDevTools: process.env.NODE_ENV === 'development',
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
                            merge: true
                        }
                    }
                },
                RecordIdentity: {
                    keyFields: ['id', 'library', ['id']]
                },
                Library: {
                    fields: {
                        attributes: {
                            merge(existing, incoming) {
                                return incoming;
                            }
                        }
                    }
                },
                VersionProfile: {
                    fields: {
                        linkedAttributes: {
                            merge(existing, incoming) {
                                return incoming;
                            }
                        }
                    }
                }
            },
            possibleTypes: gqlPossibleTypes
        })
    });

    // Load yup messages translations
    yup.setLocale({
        string: {matches: t('admin.validation_errors.matches')},
        array: {
            min: t('admin.validation_errors.min')
        },
        mixed: {
            required: t('admin.validation_errors.required')
        }
    });

    return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
};

export default ApolloHandler;
