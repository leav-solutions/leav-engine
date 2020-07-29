import {ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache} from '@apollo/client';
import {onError} from '@apollo/link-error';
import {default as React} from 'react';
import './App.css';
import AppHandler from './AppHandler';

interface IAppProps {
    token: string;
    onTokenInvalid: (message?: string) => void;
}

function App({token, onTokenInvalid}: IAppProps) {
    // This function will catch the errors from the exchange between Apollo Client and the server.
    const _handleApolloError = onError(({graphQLErrors, networkError}) => {
        if (graphQLErrors)
            graphQLErrors.map(({message, locations, path}) =>
                console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
            );

        if (networkError) console.log(`[Network error]: ${networkError}`);
    });

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            _handleApolloError,
            new HttpLink({
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
                }
            }
        })
    });

    return (
        <ApolloProvider client={gqlClient}>
            <AppHandler />
        </ApolloProvider>
    );
}

export default App;
