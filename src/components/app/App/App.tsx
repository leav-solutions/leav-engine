import ApolloClient from 'apollo-boost';
import * as React from 'react';
import {ApolloProvider} from 'react-apollo';
import Home from '../Home';

function App(): JSX.Element {
    // TODO: handle auth token properly
    const gqlClient = new ApolloClient({
        uri: process.env.REACT_APP_API_URL,
        headers: {
            Authorization: process.env.REACT_APP_USER_TOKEN
        }
    });

    return (
        <ApolloProvider client={gqlClient}>
            <div className="App">
                <Home />
            </div>
        </ApolloProvider>
    );
}

export default App;
