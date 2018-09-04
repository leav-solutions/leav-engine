import * as React from 'react';
import {ApolloProvider} from 'react-apollo';
import {BrowserRouter as Router} from 'react-router-dom';
import {create} from 'react-test-renderer';
import gqlClient from '../../__mocks__/gqlClient';
import Libraries from './Libraries';

describe('Libraries', () => {
    test('Snapshot test', async () => {
        const comp = create(
            <ApolloProvider client={gqlClient}>
                <Router>
                    <Libraries />
                </Router>
            </ApolloProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
