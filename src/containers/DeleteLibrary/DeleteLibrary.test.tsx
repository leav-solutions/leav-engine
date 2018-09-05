import * as React from 'react';
import {ApolloProvider} from 'react-apollo';
import {create} from 'react-test-renderer';
import {GET_LIBRARIES_libraries} from '../../_gqlTypes/GET_LIBRARIES';
import {Mockify} from '../../_types/Mockify';
import gqlClient from '../../__mocks__/gqlClient';
import DeleteLibrary from './DeleteLibrary';

describe('DeleteLibrary', () => {
    test('Snapshot test', async () => {
        const lib: Mockify<GET_LIBRARIES_libraries> = {
            label: null
        };

        const comp = create(
            <ApolloProvider client={gqlClient}>
                <DeleteLibrary library={lib as GET_LIBRARIES_libraries} />
            </ApolloProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
