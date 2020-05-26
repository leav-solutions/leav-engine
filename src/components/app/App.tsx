import {ApolloProvider} from '@apollo/react-hooks';
import {
    defaultDataIdFromObject,
    InMemoryCache,
    IntrospectionFragmentMatcher,
    IntrospectionResultData
} from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import {ApolloLink} from 'apollo-link';
import {onError} from 'apollo-link-error';
import {HttpLink} from 'apollo-link-http';
import {default as React, useCallback, useEffect, useState} from 'react';
import 'semantic-ui-css/semantic.min.css';
import i18n from '../../i18n';
import {getRecordIdentityCacheKey, getSysTranslationQueryLanguage} from '../../utils/utils';
import {AvailableLanguage} from '../../_types/types';
import Router from '../Router';
import LangContext from '../shared/LangContext';
import './App.css';

interface IAppProps {
    token: string;
    onTokenInvalid: (message?: string) => void;
}

function App({token, onTokenInvalid}: IAppProps) {
    const [fragmentMatcher, setFragmentMatcher] = useState<IntrospectionFragmentMatcher>();

    const _getFragmentMatcher = useCallback(async () => {
        const res = await fetch(process.env.REACT_APP_API_URL || '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token
            },
            body: JSON.stringify({
                variables: {},
                query: `{
                    __schema {
                      types {
                        kind
                        name
                        possibleTypes {
                          name
                        }
                      }
                    }
                  }
                `
            })
        });

        const resData: IntrospectionResultData = (await res.json()).data;

        // If the server sends a 401, resData will not contain the schema.
        // The try and catch allows to handle the situation.
        try {
            resData.__schema.types = resData.__schema.types.filter(typ => typ.possibleTypes !== null);

            const fragment = new IntrospectionFragmentMatcher({
                introspectionQueryResultData: resData
            });

            setFragmentMatcher(fragment);
        } catch (error) {
            onTokenInvalid('login.error.session_expired');
        }
    }, [onTokenInvalid, token]);

    // This function will catch the errors from the exchange between Apollo Client and the server.
    const _handleApolloError = (err: any) => {
        const {graphQLErrors, networkError} = err;
        if (graphQLErrors) {
            graphQLErrors.map(({message, locations, path}: {message: string; locations: string; path: string}) =>
                console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
            );
        }
        if (networkError) {
            console.log(`[Network error]: ${networkError}`);
            if (networkError.statusCode === 401) {
                onTokenInvalid('login.error.session_expired');
            }
        }
    };

    useEffect(() => {
        _getFragmentMatcher();
    }, [_getFragmentMatcher]);

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            onError(err => {
                _handleApolloError(err);
            }),
            new HttpLink({
                uri: process.env.REACT_APP_API_URL,
                headers: {
                    Authorization: token
                }
            })
        ]),
        cache: new InMemoryCache({
            fragmentMatcher,
            dataIdFromObject: obj => {
                let res;
                switch (obj.__typename) {
                    case 'RecordIdentity':
                        res =
                            !(obj as any).id || !(obj as any).library.id
                                ? defaultDataIdFromObject(obj)
                                : getRecordIdentityCacheKey((obj as any).library.id, (obj as any).id);
                        break;
                    default:
                        res = defaultDataIdFromObject(obj);
                        break;
                }
                return res;
            }
        })
    });

    const lang = getSysTranslationQueryLanguage(i18n);
    const availableLangs = process.env.REACT_APP_AVAILABLE_LANG
        ? process.env.REACT_APP_AVAILABLE_LANG.split(',').map(l => AvailableLanguage[l as AvailableLanguage])
        : [];
    const defaultLang = process.env.REACT_APP_DEFAULT_LANG
        ? AvailableLanguage[process.env.REACT_APP_DEFAULT_LANG as AvailableLanguage]
        : AvailableLanguage.en;

    return (
        <ApolloProvider client={gqlClient}>
            <LangContext.Provider value={{lang, availableLangs, defaultLang}}>
                <Router />
            </LangContext.Provider>
        </ApolloProvider>
    );
}

export default App;
