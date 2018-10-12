import * as React from 'react';
import {ApolloProvider} from 'react-apollo';
import {create} from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';
import {Mockify} from 'src/_types/Mockify';
import gqlClient from '../../__mocks__/gqlClient';
import DeleteAttribute from './DeleteAttribute';

describe('DeleteAttribute', () => {
    test('Snapshot test', async () => {
        const attr: Mockify<GET_ATTRIBUTES_attributes> = {
            label: null
        };
        const comp = create(
            <ApolloProvider client={gqlClient}>
                <DeleteAttribute attribute={attr as GET_ATTRIBUTES_attributes} />
            </ApolloProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
