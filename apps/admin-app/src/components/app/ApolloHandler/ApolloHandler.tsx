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
    ServerError,
    split
} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {getMainDefinition} from '@apollo/client/utilities';
import {createClient} from 'graphql-ws';
import useGraphqlPossibleTypes from 'hooks/useGraphqlPossibleTypes';
import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {addMessage, MessagesTypes} from 'redux/messages/messages';
import {endMutation, startMutation} from 'redux/mutationsWatcher/mutationsWatcher';
import {Message, SemanticICONS} from 'semantic-ui-react';
import * as yup from 'yup';
import {ErrorTypes} from '_types/errors';
import Loading from '../../shared/Loading';
import {ORIGIN_URL, APPS_ENDPOINT, LOGIN_ENDPOINT, API_ENDPOINT, WS_URL} from '../../../constants';

interface IApolloHandlerProps {
    children: ReactNode;
}

export const UNAUTHENTICATED = 'UNAUTHENTICATED';

const _redirectToLogin = () =>
    window.location.replace(`${ORIGIN_URL}/${APPS_ENDPOINT}/${LOGIN_ENDPOINT}/?dest=${window.location.pathname}`);

const ApolloHandler = ({children}: IApolloHandlerProps): JSX.Element => {
    const dispatch = useDispatch();
    const {t} = useTranslation();

    const {loading: possibleTypesLoading, error: possibleTypesError, possibleTypes} = useGraphqlPossibleTypes(
        `${ORIGIN_URL}/${API_ENDPOINT}`
    );

    if (possibleTypesLoading) {
        return <Loading style={{margin: '15rem'}} />;
    }

    if (possibleTypesError) {
        if (possibleTypesError.includes(UNAUTHENTICATED)) {
            _redirectToLogin();
            return <></>;
        }

        return (
            <Message negative style={{margin: '2em'}}>
                {possibleTypesError}
            </Message>
        );
    }

    const _handleApolloError = onError(({graphQLErrors, networkError, operation}) => {
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
            _redirectToLogin();
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
                uri: `${ORIGIN_URL}/${API_ENDPOINT}`
            })
        ]),
        connectToDevTools: process.env.NODE_ENV === 'development',
        cache: new InMemoryCache({
            // For records, ID might sometimes be in the _id property to avoid messing up
            // with the ID attribute (eg. in the getRecordPropertiesQuery).
            // Thus, we have to force Apollo to use the _id field for cache key.
            dataIdFromObject(responseObject) {
                // If it's not a record, just use regular caching
                if (
                    !possibleTypes ||
                    !possibleTypes.Record.includes(responseObject.__typename) ||
                    (!responseObject._id && !responseObject.id)
                ) {
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
                        gqlNames: {
                            merge: true
                        },
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
            possibleTypes
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
