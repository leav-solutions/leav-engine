// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache, ServerError} from '@apollo/client';
import {onError} from '@apollo/link-error';
import {message, Spin} from 'antd';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import fetch from 'cross-fetch';
import useGraphqlPossibleTypes from 'hooks/useGraphqlPossibleTypes';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface IApolloHandlerProps {
    children: ReactNode;
}

export const UNAUTHENTICATED = 'UNAUTHENTICATED';

const _redirectToLogin = () =>
    window.location.replace(`${import.meta.env.VITE_LOGIN_ENDPOINT}?dest=${window.location.pathname}`);

function ApolloHandler({children}: IApolloHandlerProps): JSX.Element {
    const {t} = useTranslation();

    const {loading, error, possibleTypes} = useGraphqlPossibleTypes(import.meta.env.VITE_API_URL);

    if (loading) {
        return <Spin />;
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
            (networkError as ServerError)?.statusCode === 401 ||
            (graphQLErrors ?? []).some(err => err.extensions.code === 'UNAUTHENTICATED')
        ) {
            window.location.replace(`${import.meta.env.VITE_LOGIN_ENDPOINT}?dest=${window.location.pathname}`);
        }

        message.error(errorContent);
    });

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            (_handleApolloError as unknown) as ApolloLink,
            new HttpLink({
                uri: import.meta.env.VITE_API_URL,
                fetch
            })
        ]),
        cache: new InMemoryCache({
            possibleTypes
        })
    });

    return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
}

export default ApolloHandler;
