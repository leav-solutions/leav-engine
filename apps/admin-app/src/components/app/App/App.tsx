// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloProvider} from '@apollo/react-common';
import {
    defaultDataIdFromObject,
    InMemoryCache,
    IntrospectionFragmentMatcher,
    IntrospectionResultData
} from 'apollo-cache-inmemory';
import {ApolloClient} from 'apollo-client';
import {ApolloLink} from 'apollo-link';
import {ErrorResponse, onError} from 'apollo-link-error';
import {HttpLink} from 'apollo-link-http';
import {ServerError} from 'apollo-link-http-common';
import React, {useCallback, useEffect, useState} from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {addMessage, MessagesTypes} from 'redux/messages/messages';
import {SemanticICONS} from 'semantic-ui-react';
import * as yup from 'yup';
import {ErrorTypes} from '_types/errors';
import {isAllowedQuery, IsAllowedQuery} from '../../../queries/permissions/isAllowedQuery';
import {getRecordIdentityCacheKey, getSysTranslationQueryLanguage, permsArrayToObject} from '../../../utils/utils';
import {AvailableLanguage, PermissionsActions, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import LangContext from '../../shared/LangContext';
import Loading from '../../shared/Loading';
import UserContext from '../../shared/UserContext';
import {IUserContext} from '../../shared/UserContext/UserContext';
import Home from '../Home';
import MessagesDisplay from '../MessagesDisplay';

interface IAppProps {
    token: string;
    onTokenInvalid: (message?: string) => void;
}

const App = ({token, onTokenInvalid}: IAppProps): JSX.Element => {
    const [fragmentMatcher, setFragmentMatcher] = useState<IntrospectionFragmentMatcher | null>(null);
    const dispatch = useDispatch();
    const {t, i18n} = useTranslation();

    const _handleApolloError = (err: ErrorResponse) => {
        const {graphQLErrors, networkError} = err;
        let title: string;
        let content: string;
        let icon: SemanticICONS;
        if (graphQLErrors) {
            graphQLErrors.map(graphqlError => {
                const {message, extensions} = graphqlError;

                title = t(`errors.${extensions?.code ?? ErrorTypes.PERMISSION_ERROR}`);
                switch (extensions?.code) {
                    case ErrorTypes.VALIDATION_ERROR:
                        content = '';
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
            if ((networkError as ServerError).statusCode === 401) {
                return onTokenInvalid('login.error.session_expired');
            }

            title = t('errors.network_error');
            icon = 'plug';
        }

        dispatch(
            addMessage({
                type: MessagesTypes.ERROR,
                title,
                content,
                icon
            })
        );
    };

    /**
     * Retrieve information about types from server to give Apollo client some information about our schema and be able
     * to do fragments on interface or union
     * More info: https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher
     */
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

        // If the server sends a 401, resData will not contain the shema.
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

    useEffect(() => {
        _getFragmentMatcher();
    }, [_getFragmentMatcher]);

    if (!fragmentMatcher) {
        return <Loading />;
    }

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            onError((err: ErrorResponse) => {
                _handleApolloError(err);
            }),
            new HttpLink({
                uri: process.env.REACT_APP_API_URL + `?lang=${i18n.language}`,
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
                            !(obj as RecordIdentity_whoAmI).id || !(obj as RecordIdentity_whoAmI).library.id
                                ? defaultDataIdFromObject(obj)
                                : getRecordIdentityCacheKey(
                                      (obj as RecordIdentity_whoAmI).library.id,
                                      (obj as RecordIdentity_whoAmI).id
                                  );
                        break;
                    default:
                        res = defaultDataIdFromObject(obj);
                        break;
                }
                return res;
            }
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

    return (
        <ApolloProvider client={gqlClient}>
            <IsAllowedQuery
                query={isAllowedQuery}
                variables={{
                    type: PermissionTypes.app,
                    actions: Object.values(PermissionsActions).filter(a => !!a.match(/^app_/))
                }}
            >
                {({loading, data, error}) => {
                    if (loading) {
                        return <Loading />;
                    }

                    // Cache admin permissions
                    if (!data || !data.isAllowed || error) {
                        return <p>Could not retrieve permissions!</p>;
                    }

                    // TODO: get real user ID and name
                    const userData: IUserContext = {
                        id: 1,
                        name: '',
                        permissions: permsArrayToObject(data.isAllowed)
                    };

                    const lang = getSysTranslationQueryLanguage(i18n);
                    const availableLangs = process.env.REACT_APP_AVAILABLE_LANG
                        ? process.env.REACT_APP_AVAILABLE_LANG.split(',').map(l => AvailableLanguage[l])
                        : [];
                    const defaultLang = process.env.REACT_APP_DEFAULT_LANG
                        ? AvailableLanguage[process.env.REACT_APP_DEFAULT_LANG]
                        : AvailableLanguage.en;

                    return (
                        <DndProvider backend={HTML5Backend}>
                            <LangContext.Provider value={{lang, availableLangs, defaultLang}}>
                                <UserContext.Provider value={userData}>
                                    <div className="App height100">
                                        <MessagesDisplay />
                                        <Home />
                                    </div>
                                </UserContext.Provider>
                            </LangContext.Provider>
                        </DndProvider>
                    );
                }}
            </IsAllowedQuery>
        </ApolloProvider>
    );
};

export default App;
