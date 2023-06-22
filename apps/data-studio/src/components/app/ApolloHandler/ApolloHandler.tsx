// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    defaultDataIdFromObject,
    InMemoryCache,
    ServerError,
    split
} from '@apollo/client';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {getMainDefinition} from '@apollo/client/utilities';
import {onError} from '@apollo/link-error';
import {ErrorDisplay, Loading} from '@leav/ui';
import {IInfo, InfoChannel, InfoType} from '_types/types';
import {createUploadLink} from 'apollo-upload-client';
import {createClient} from 'graphql-ws';
import useGraphqlPossibleTypes from 'hooks/useGraphqlPossibleTypes';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {addInfo} from 'reduxStore/infos';
import {useAppDispatch} from 'reduxStore/store';
import {API_ENDPOINT, APPS_ENDPOINT, LOGIN_ENDPOINT, ORIGIN_URL, WS_URL} from '../../../constants';

interface IApolloHandlerProps {
    children: ReactNode;
}

export const UNAUTHENTICATED = 'UNAUTHENTICATED';

const _redirectToLogin = () =>
    window.location.replace(`${ORIGIN_URL}/${APPS_ENDPOINT}/${LOGIN_ENDPOINT}/?dest=${window.location.pathname}`);

function ApolloHandler({children}: IApolloHandlerProps): JSX.Element {
    const {t, i18n} = useTranslation();
    const dispatch = useAppDispatch();

    const {loading, error, possibleTypes} = useGraphqlPossibleTypes(`${ORIGIN_URL}/${API_ENDPOINT}`);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        if (error.includes(UNAUTHENTICATED)) {
            _redirectToLogin();
            return <></>;
        }

        return <ErrorDisplay message={error} />;
    }

    // This function will catch the errors from the exchange between Apollo Client and the server.
    const _handleApolloError = onError(({graphQLErrors, networkError}) => {
        if (
            (networkError as ServerError)?.statusCode === 401 ||
            (graphQLErrors ?? [])?.some(err => err?.extensions?.code === 'UNAUTHENTICATED')
        ) {
            _redirectToLogin();
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
                            channel: InfoChannel.passive
                        };
                        break;
                }

                dispatch(addInfo(info));

                const errorMessage = `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`;
                return errorMessage;
            });
        }

        if (networkError) {
            const errorContent = t('error.network_error_occurred');

            const info: IInfo = {
                content: errorContent,
                type: InfoType.error,
                channel: InfoChannel.trigger
            };

            dispatch(addInfo(info));
        }

        if (!graphQLErrors && !networkError) {
            const errorContent = t('error.error_occurred');

            const info: IInfo = {
                content: errorContent,
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
            createUploadLink({uri: `${ORIGIN_URL}/${API_ENDPOINT}?lang=${i18n.language}`})
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
                    keyFields: ['id', 'library', ['id']],
                    fields: {
                        preview: {
                            merge(existing, incoming) {
                                return !incoming && !existing ? null : {...existing, ...incoming};
                            }
                        }
                    }
                },
                Library: {
                    fields: {
                        gqlNames: {
                            merge(existing, incoming) {
                                return {...existing, ...incoming};
                            }
                        },
                        permissions: {
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
            possibleTypes
        })
    });

    return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
}

export default ApolloHandler;
