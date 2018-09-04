import {History} from 'history';
import * as React from 'react';
import {ApolloProvider} from 'react-apollo';
import {create} from 'react-test-renderer';
import {Mockify} from '../../_types/Mockify';
import gqlClient from '../../__mocks__/gqlClient';
import EditLibrary from './EditLibrary';

describe('EditLibrary', () => {
    test('Snapshot test', async () => {
        const mockMatch: any = {params: {id: 'test'}};
        const mockHistory: Mockify<History> = {};

        const comp = create(
            <ApolloProvider client={gqlClient}>
                <EditLibrary match={mockMatch} history={mockHistory as History} />
            </ApolloProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
