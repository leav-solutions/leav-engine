import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    defaultDataIdFromObject,
    HttpLink,
    InMemoryCache
} from '@apollo/client';
import {onError} from '@apollo/link-error';
import {default as React} from 'react';
import 'semantic-ui-css/semantic.min.css';
import {getRecordIdentityCacheKey} from '../../utils/utils';
import './App.css';
import AppHandler from './AppHandler';

interface IAppProps {
    token: string;
    onTokenInvalid: (message?: string) => void;
}

function App({token, onTokenInvalid}: IAppProps) {
    // Not compatible with apollo 3

    // const [fragmentMatcher, setFragmentMatcher] = useState<IntrospectionFragmentMatcher>();

    // const _getFragmentMatcher = useCallback(async () => {
    //     const res = await fetch(process.env.REACT_APP_API_URL || '', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Authorization: token
    //         },
    //         body: JSON.stringify({
    //             variables: {},
    //             query: `{
    //                 __schema {
    //                   types {
    //                     kind
    //                     name
    //                     possibleTypes {
    //                       name
    //                     }
    //                   }
    //                 }
    //               }
    //             `
    //         })
    //     });

    //     const resData: IntrospectionResultData = (await res.json()).data;

    //     // If the server sends a 401, resData will not contain the schema.
    //     // The try and catch allows to handle the situation.
    //     try {
    //         resData.__schema.types = resData.__schema.types.filter(typ => typ.possibleTypes !== null);

    //         const fragment = new IntrospectionFragmentMatcher({
    //             introspectionQueryResultData: resData
    //         });

    //         setFragmentMatcher(fragment);
    //     } catch (error) {
    //         onTokenInvalid('login.error.session_expired');
    //     }
    // }, [onTokenInvalid, token]);

    // Not compatible with Apollo 3

    // // This function will catch the errors from the exchange between Apollo Client and the server.
    // const _handleApolloError = (err: any) => {
    //     const {graphQLErrors, networkError} = err;
    //     if (graphQLErrors) {
    //         graphQLErrors.map(({message, locations, path}: {message: string; locations: string; path: string}) =>
    //             console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    //         );
    //     }
    //     if (networkError) {
    //         console.log(`[Network error]: ${networkError}`);
    //         if (networkError.statusCode === 401) {
    //             onTokenInvalid('login.error.session_expired');
    //         }
    //     }
    // };

    // useEffect(() => {
    //     _getFragmentMatcher();
    // }, [_getFragmentMatcher]);

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
            dataIdFromObject: obj => {
                let res;
                switch (obj.__typename) {
                    case 'RecordIdentity':
                        res =
                            !(obj as any)?.id || !(obj as any)?.library?.id
                                ? defaultDataIdFromObject(obj, {})
                                : getRecordIdentityCacheKey((obj as any).library.id, (obj as any).id);
                        break;
                    default:
                        res = defaultDataIdFromObject(obj, {});
                        break;
                }
                return res;
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
