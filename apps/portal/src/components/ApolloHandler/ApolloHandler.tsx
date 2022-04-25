// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache, ServerError} from '@apollo/client';
import {onError} from '@apollo/link-error';
import {message} from 'antd';
import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface IApolloHandlerProps {
    children: ReactNode;
}

export const UNAUTHORIZED = 'Unauthorized';

function ApolloHandler({children}: IApolloHandlerProps): JSX.Element {
    const {t} = useTranslation();

    // This function will catch the errors from the exchange between Apollo Client and the server.
    const _handleApolloError = onError(({graphQLErrors, networkError}) => {
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
            (networkError as ServerError).statusCode === 401 ||
            graphQLErrors.some(err => err.extensions.code === 'UNAUTHENTICATED')
        ) {
            window.location.replace(`${process.env.REACT_APP_LOGIN_ENDPOINT}?dest=${window.location.pathname}`);
        }

        message.error(errorContent);
    });

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            _handleApolloError,
            new HttpLink({
                uri: process.env.REACT_APP_API_URL
            })
        ]),
        cache: new InMemoryCache({
            possibleTypes: {Record: ['User']}
        })
    });

    return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
}

export default ApolloHandler;
