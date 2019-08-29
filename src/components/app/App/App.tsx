import {ApolloProvider} from '@apollo/react-common';
import {InMemoryCache, IntrospectionFragmentMatcher, IntrospectionResultData} from 'apollo-cache-inmemory';
import {ApolloClient} from 'apollo-client';
import {ApolloLink} from 'apollo-link';
import {onError} from 'apollo-link-error';
import {HttpLink} from 'apollo-link-http';
import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import * as yup from 'yup';
import {isAllowedQuery, IsAllowedQuery} from '../../../queries/permissions/isAllowedQuery';
import {getSysTranslationQueryLanguage, permsArrayToObject} from '../../../utils/utils';
import {PermissionsActions, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import LangContext from '../../shared/LangContext';
import Loading from '../../shared/Loading';
import UserContext from '../../shared/UserContext';
import {IUserContext} from '../../shared/UserContext/UserContext';
import Home from '../Home';

interface IAppState {
    fragmentMatcher: IntrospectionFragmentMatcher | null;
}

interface IAppProps extends WithNamespaces {
    token: string;
    onTokenInvalid: (message?: string) => void;
}

class App extends React.Component<IAppProps, IAppState> {
    constructor(props) {
        super(props);

        this.state = {
            fragmentMatcher: null
        };

        this._getFragmentMatcher();
    }

    public render() {
        const {i18n, t} = this.props;
        const {fragmentMatcher} = this.state;
        const {token} = this.props;

        if (!fragmentMatcher) {
            return <Loading />;
        }

        const gqlClient = new ApolloClient({
            link: ApolloLink.from([
                onError(err => {
                    this._handleApolloError(err);
                }),
                new HttpLink({
                    uri: process.env.REACT_APP_API_URL,
                    headers: {
                        Authorization: token
                    }
                })
            ]),
            cache: new InMemoryCache({fragmentMatcher})
        });

        // Load yup messages translations
        yup.setLocale({
            string: {matches: t('admin.validation_errors.matches')},
            mixed: {
                required: t('admin.validation_errors.required')
            }
        });

        return (
            <ApolloProvider client={gqlClient}>
                <IsAllowedQuery
                    query={isAllowedQuery}
                    variables={{
                        type: PermissionTypes.admin,
                        actions: [
                            PermissionsActions.admin_access_attributes,
                            PermissionsActions.admin_access_libraries,
                            PermissionsActions.admin_access_permissions,
                            PermissionsActions.admin_access_trees,
                            PermissionsActions.admin_create_attribute,
                            PermissionsActions.admin_create_library,
                            PermissionsActions.admin_create_tree,
                            PermissionsActions.admin_delete_attribute,
                            PermissionsActions.admin_delete_library,
                            PermissionsActions.admin_delete_tree,
                            PermissionsActions.admin_edit_attribute,
                            PermissionsActions.admin_edit_library,
                            PermissionsActions.admin_edit_permission,
                            PermissionsActions.admin_edit_tree
                        ]
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

                        return (
                            <LangContext.Provider value={{lang}}>
                                <UserContext.Provider value={userData}>
                                    <div className="App height100">
                                        <Home />
                                    </div>
                                </UserContext.Provider>
                            </LangContext.Provider>
                        );
                    }}
                </IsAllowedQuery>
            </ApolloProvider>
        );
    }

    /**
     * Retrieve information about types from server to give Apollo client some information about our schema and be able
     * to do fragments on interface or union
     * More info: https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher
     */
    private _getFragmentMatcher = async () => {
        const {token} = this.props;
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
            resData.__schema.types = resData.__schema.types.filter(t => t.possibleTypes !== null);

            this.setState({
                fragmentMatcher: new IntrospectionFragmentMatcher({
                    introspectionQueryResultData: resData
                })
            });
        } catch (error) {
            this.props.onTokenInvalid('login.error.session_expired');
        }
    }

    // This function will catch the errors from the exchange between Apollo Client and the server.
    private _handleApolloError = err => {
        const {graphQLErrors, networkError} = err;
        if (graphQLErrors) {
            graphQLErrors.map(({message, locations, path}) =>
                console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
            );
        }
        if (networkError) {
            console.log(`[Network error]: ${networkError}`);
            if (networkError.statusCode === 401) {
                this.props.onTokenInvalid('login.error.session_expired');
            }
        }
    }
}

export default withNamespaces()(App);
