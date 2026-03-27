// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    defaultDataIdFromObject,
    InMemoryCache,
    Observable,
    type ServerError,
    split,
} from '@apollo/client';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {getMainDefinition} from '@apollo/client/utilities';
import {onError} from '@apollo/link-error';
import {gqlPossibleTypes, useRedirectToLogin} from '@leav/ui';
import {createUploadLink} from 'apollo-upload-client';
import {CloseCode, createClient} from 'graphql-ws';
import {type FunctionComponent} from 'react';
import {useTranslation} from 'react-i18next';
import {addInfo} from '../../../reduxStore/infos';
import {useAppDispatch} from '../../../reduxStore/store';
import {type IInfo, InfoChannel, InfoType} from '../../../_types/types';
import {API_ENDPOINT, ORIGIN_URL, WS_URL} from '../../../constants';

const ApolloHandler: FunctionComponent = ({children}) => {
    const {t, i18n} = useTranslation();
    const dispatch = useAppDispatch();
    const {checkAuthOrRedirectToLogin} = useRedirectToLogin();

    // This function will catch the errors from the exchange between Apollo Client and the server.
    const errorLink = onError(({graphQLErrors, networkError, operation, forward}) => {
        if (
            (networkError as ServerError)?.statusCode === 401 ||
            (graphQLErrors ?? [])?.some(err => err?.extensions?.code === 'UNAUTHENTICATED')
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
                type: InfoType.ERROR,
                channel: InfoChannel.TRIGGER,
            };

            dispatch(addInfo(info));
        }

        if (!graphQLErrors && !networkError) {
            const info: IInfo = {
                content: t('error.error_occurred'),
                type: InfoType.ERROR,
                channel: InfoChannel.TRIGGER,
            };

            dispatch(addInfo(info));
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

    // set uri in operation context because it is the only way for createUploadLink to have custom url by operation
    const _setOperationUri = new ApolloLink((operation, forward) => {
        operation.setContext({
            ...operation.getContext(),
            uri: `${ORIGIN_URL}/${API_ENDPOINT}?lang=${i18n.language}&opName=${operation.operationName}`,
        });

        return forward(operation);
    });

    const splitLink = split(({query}) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    }, wsLink);

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            errorLink,
            splitLink,
            _setOperationUri,
            createUploadLink({
                headers: {
                    'Apollo-Require-Preflight': 'true', // Required to get upload working with Apollo Server v4+
                },
            }),
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
                    keyFields: false,
                },
                Record: {
                    keyFields: ['id', 'whoAmI', ['library', ['id']]],
                },
                RecordIdentity: {
                    keyFields: ['id', 'library', ['id']],
                    fields: {
                        preview: {
                            merge(existing, incoming) {
                                return !incoming && !existing ? null : incoming;
                            },
                        },
                    },
                },
                Library: {
                    fields: {
                        permissions: {
                            merge(existing, incoming) {
                                return {...existing, ...incoming};
                            },
                        },
                        previewsSettings: {
                            merge(existing, incoming) {
                                return incoming;
                            },
                        },
                    },
                },
                Query: {
                    fields: {
                        treeContent: {
                            merge(existing, incoming) {
                                return [...incoming];
                            },
                        },
                    },
                },
                Form: {
                    keyFields: ['id', 'library', ['id']],
                },
                UserData: {
                    keyFields: ['global'],
                    fields: {
                        data: {
                            merge(existing, incoming) {
                                return {...existing, ...incoming};
                            },
                        },
                    },
                },
                Tree: {
                    fields: {
                        permissions: {
                            merge(existing, incoming) {
                                return {...existing, ...incoming};
                            },
                        },
                        libraries: {
                            merge(existing, incoming) {
                                return incoming;
                            },
                        },
                    },
                },
                TreeNode: {
                    fields: {
                        children: {
                            merge(existing, incoming) {
                                return incoming;
                            },
                        },
                    },
                },
                RecordForm: {
                    keyFields: ['id', 'recordId', 'library', ['id']],
                },
                FormElementWithValues: {
                    keyFields: false,
                },
            },
            possibleTypes: gqlPossibleTypes,
        }),
    });

    return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
};

export default ApolloHandler;
