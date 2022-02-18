// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    defaultDataIdFromObject,
    InMemoryCache,
    ServerError
} from '@apollo/client';
import {onError} from '@apollo/link-error';
import {Spin} from 'antd';
import {createUploadLink} from 'apollo-upload-client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import useGraphqlPossibleTypes from 'hooks/useGraphqlPossibleTypes';
import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {addNotification} from 'redux/notifications';
import {useAppDispatch} from 'redux/store';
import {INotification, NotificationChannel, NotificationType} from '_types/types';

interface IApolloHandlerProps {
    token: string;
    onTokenInvalid: (message?: string) => void;
    children: ReactNode;
}

export const UNAUTHORIZED = 'Unauthorized';

function ApolloHandler({token, children, onTokenInvalid}: IApolloHandlerProps): JSX.Element {
    const {t} = useTranslation();
    const dispatch = useAppDispatch();

    const {loading, error, possibleTypes} = useGraphqlPossibleTypes(process.env.REACT_APP_API_URL, token);

    if (loading) {
        return <Spin />;
    }

    if (error) {
        if (error.includes(UNAUTHORIZED)) {
            onTokenInvalid();
            return <></>;
        }

        return <ErrorDisplay message={error} />;
    }

    // This function will catch the errors from the exchange between Apollo Client and the server.
    const _handleApolloError = onError(({graphQLErrors, networkError}) => {
        if (graphQLErrors) {
            graphQLErrors.map(({message, locations, path, extensions}) => {
                const errorContent = t('error.graphql_error_occurred', {
                    error: message,
                    interpolation: {escapeValue: false}
                });

                let notification: INotification;

                switch (extensions.code) {
                    case 'INTERNAL_ERROR':
                        notification = {
                            content: errorContent,
                            type: NotificationType.error,
                            channel: NotificationChannel.trigger
                        };
                        break;
                    case 'VALIDATION_ERROR':
                    case 'PERMISSION_ERROR':
                    default:
                        notification = {
                            content: errorContent,
                            type: NotificationType.error,
                            channel: NotificationChannel.passive
                        };
                        break;
                }

                dispatch(addNotification(notification));

                const errorMessage = `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`;
                return errorMessage;
            });
        }

        if (networkError) {
            if ((networkError as ServerError).statusCode === 401) {
                onTokenInvalid();
            }

            const errorContent = t('error.network_error_occurred');

            const notification: INotification = {
                content: errorContent,
                type: NotificationType.error,
                channel: NotificationChannel.trigger
            };

            dispatch(addNotification(notification));
        }

        if (!graphQLErrors && !networkError) {
            const errorContent = t('error.error_occurred');

            const notification: INotification = {
                content: errorContent,
                type: NotificationType.error,
                channel: NotificationChannel.trigger
            };

            dispatch(addNotification(notification));
        }
    });

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            _handleApolloError,
            createUploadLink({
                uri: process.env.REACT_APP_API_URL,
                headers: {
                    Authorization: token
                }
            })
        ]),
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
                EmbeddedAttribute: {
                    keyFields: false
                },
                RecordIdentity: {
                    keyFields: ['id', 'library', ['id']]
                },
                Library: {
                    fields: {
                        gqlNames: {
                            merge(existing, incoming) {
                                return {...existing, ...incoming};
                            }
                        }
                    }
                },
                Query: {
                    fields: {
                        treeContent: {
                            merge(existing, incoming) {
                                return [...incoming];
                            }
                        }
                    }
                },
                Form: {
                    keyFields: ['id', 'library', ['id']]
                },
                UserData: {
                    keyFields: ['global'],
                    fields: {
                        data: {
                            merge(existing, incoming) {
                                return {...existing, ...incoming};
                            }
                        }
                    }
                },
                Tree: {
                    fields: {
                        permissions: {
                            merge: true
                        }
                    }
                },
                TreeNode: {
                    fields: {
                        children: {
                            merge(existing, incoming) {
                                return incoming;
                            }
                        }
                    }
                },
                RecordForm: {
                    keyFields: ['id', 'recordId', 'library', ['id']]
                },
                FormElementWithValues: {
                    keyFields: false
                }
            },
            possibleTypes
        })
    });

    return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
}

export default ApolloHandler;
