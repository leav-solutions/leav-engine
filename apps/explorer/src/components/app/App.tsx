// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloClient, ApolloLink, ApolloProvider, gql, InMemoryCache} from '@apollo/client';
import {createUploadLink} from 'apollo-upload-client';
import {onError} from '@apollo/link-error';
import {default as React} from 'react';
import './App.css';
import ThemeHandler from './ThemeHandler';

interface IAppProps {
    token: string;
    onTokenInvalid: (message?: string) => void;
}

function App({token, onTokenInvalid}: IAppProps) {
    // This function will catch the errors from the exchange between Apollo Client and the server.
    const _handleApolloError = onError(({graphQLErrors, networkError}) => {
        if (graphQLErrors) {
graphQLErrors.map(({message, locations, path}) =>
                console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
            );
}

        if (networkError) {
console.error(`[Network error]: ${networkError}`);
}
    });

    const typeDefs = gql`
        extend type User {
            userId: String!
            userName: String!
            userPermissions: [String!]!
        }

        extend type Lang {
            lang: String!
            availableLangs: [String!]!
            defaultLang: String!
        }

        extend type ActiveLibrary {
            activeLibId: String!
            activeLibQueryName: String!
            activeLibName: String!
            activeLibFilterName: String!
        }
    `;

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
                        notificationsStack: {
                            merge(existing, incoming) {
                                return [...incoming];
                            }
                        },
                        baseNotification: {
                            merge(existing, incoming) {
                                return incoming;
                            }
                        }
                    }
                }
            }
        }),
        typeDefs
    });

    return (
        <ApolloProvider client={gqlClient}>
            <ThemeHandler />
        </ApolloProvider>
    );
}

export default App;
