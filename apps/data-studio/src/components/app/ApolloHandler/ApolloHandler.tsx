// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    defaultDataIdFromObject,
    InMemoryCache,
    Observable,
    ServerError,
    split
} from '@apollo/client';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {getMainDefinition} from '@apollo/client/utilities';
import {onError} from '@apollo/link-error';
import {gqlPossibleTypes, useRefreshToken} from '@leav/ui';
import {createUploadLink} from 'apollo-upload-client';
import {createClient} from 'graphql-ws';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {addInfo} from 'reduxStore/infos';
import {useAppDispatch} from 'reduxStore/store';
import {IInfo, InfoChannel, InfoType} from '_types/types';
import {API_ENDPOINT, APPS_ENDPOINT, LOGIN_ENDPOINT, ORIGIN_URL, UNAUTHENTICATED, WS_URL} from '../../../constants';

interface IApolloHandlerProps {
    children: ReactNode;
}

const _redirectToLogin = () =>
    window.location.replace(`${ORIGIN_URL}/${APPS_ENDPOINT}/${LOGIN_ENDPOINT}/?dest=${window.location.pathname}`);

function ApolloHandler({children}: IApolloHandlerProps): JSX.Element {
    const {t, i18n} = useTranslation();
    const dispatch = useAppDispatch();
    const {refreshToken} = useRefreshToken();

    // This function will catch the errors from the exchange between Apollo Client and the server.
    const _handleApolloError = onError(({graphQLErrors, networkError, operation, forward}) => {
        if (
            (networkError as ServerError)?.statusCode === 401 ||
            (graphQLErrors ?? [])?.some(err => err?.extensions?.code === 'UNAUTHENTICATED')
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
            graphQLErrors.map(({message, locations, path, extensions}) => {
                const errorContent = t('error.graphql_error_occurred', {
                    error: message,
                    interpolation: {escapeValue: false}
                });

                let info: IInfo;

                switch (extensions?.code) {
                    case 'INTERNAL_ERROR':
                        info = {
                            content: errorContent,
                            type: InfoType.error,
                            channel: InfoChannel.trigger
                        };
                        break;
                    case 'VALIDATION_ERROR':
                    case 'PERMISSION_ERROR':
                    default:
                        info = {
                            content: errorContent,
                            type: InfoType.error,
                            channel: InfoChannel.trigger
                        };
                        break;
                }

                dispatch(addInfo(info));

                const errorMessage = `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`;
                return errorMessage;
            });
        }

        if (networkError) {
            // Check if error response is JSON
            try {
                JSON.parse(networkError.message);
            } catch (e) {
                // If not replace parsing error message with real one
                networkError.message = t('error.network_error_occured_details');
            }

            const errorContent = t('error.network_error_occurred');

            const info: IInfo = {
                content: errorContent,
                type: InfoType.error,
                channel: InfoChannel.trigger
            };

            dispatch(addInfo(info));
        }

        if (!graphQLErrors && !networkError) {
            const info: IInfo = {
                content: t('error.error_occurred'),
                type: InfoType.error,
                channel: InfoChannel.trigger
            };

            dispatch(addInfo(info));
        }
    });

    const wsLink = new GraphQLWsLink(
        createClient({
            url: `${WS_URL}/${API_ENDPOINT}`
        })
    );

    const splitLink = split(({query}) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    }, wsLink);

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            _handleApolloError,
            splitLink,
            createUploadLink({
                uri: `${ORIGIN_URL}/${API_ENDPOINT}?lang=${i18n.language}`,
                headers: {
                    'Apollo-Require-Preflight': 'true' // Required to get upload working with Apollo Server v4+
                }
            })
        ]),
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
                EmbeddedAttribute: {
                    keyFields: false
                },
                Record: {
                    keyFields: ['id', 'whoAmI', ['library', ['id']]]
                },
                RecordIdentity: {
                    keyFields: ['id', 'library', ['id']],
                    fields: {
                        preview: {
                            merge(existing, incoming) {
                                return !incoming && !existing ? null : incoming;
                            }
                        }
                    }
                },
                Library: {
                    fields: {
                        permissions: {
                            merge(existing, incoming) {
                                return {...existing, ...incoming};
                            }
                        },
                        previewsSettings: {
                            merge(existing, incoming) {
                                return incoming;
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
                        },
                        libraries: {
                            merge(existing, incoming) {
                                return incoming;
                            }
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
            possibleTypes: gqlPossibleTypes
        })
    });

    return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
}

export default ApolloHandler;
