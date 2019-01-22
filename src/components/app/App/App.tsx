import ApolloClient, {InMemoryCache, IntrospectionFragmentMatcher, IntrospectionResultData} from 'apollo-boost';
import fetch from 'node-fetch';
import * as React from 'react';
import {ApolloProvider} from 'react-apollo';
import Loading from 'src/components/shared/Loading';
import Home from '../Home';

interface IAppState {
    fragmentMatcher: IntrospectionFragmentMatcher | null;
}

class App extends React.Component<any, IAppState> {
    // TODO: handle auth token properly
    constructor(props) {
        super(props);

        this.state = {fragmentMatcher: null};

        this._getFragmentMatcher();
    }

    public render() {
        const {fragmentMatcher} = this.state;

        if (!fragmentMatcher) {
            return <Loading />;
        }

        const gqlClient = new ApolloClient({
            uri: process.env.REACT_APP_API_URL,
            headers: {
                Authorization: process.env.REACT_APP_USER_TOKEN
            },
            cache: new InMemoryCache({fragmentMatcher})
        });

        return (
            <ApolloProvider client={gqlClient}>
                <div className="App height100">
                    <Home />
                </div>
            </ApolloProvider>
        );
    }

    /**
     * Retrieve information about types from server to give Apollo client some information about our schema and be able
     * to do fragments on interface or union
     * More info: https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher
     */
    private _getFragmentMatcher = async () => {
        const res = await fetch(process.env.REACT_APP_API_URL || '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: process.env.REACT_APP_USER_TOKEN || ''
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
        resData.__schema.types = resData.__schema.types.filter(t => t.possibleTypes !== null);

        this.setState({
            fragmentMatcher: new IntrospectionFragmentMatcher({
                introspectionQueryResultData: resData
            })
        });
    }
}

export default App;
