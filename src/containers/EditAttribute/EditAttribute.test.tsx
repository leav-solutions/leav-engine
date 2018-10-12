import * as React from 'react';
import {ApolloProvider} from 'react-apollo';
import {match} from 'react-router';
import {create} from 'react-test-renderer';
import {Mockify} from '../../_types/Mockify';
import gqlClient from '../../__mocks__/gqlClient';
import EditAttribute, {IEditAttributeMatchParams} from './EditAttribute';

describe('EditAttribute', () => {
    test('Snapshot test', async () => {
        const mockMatch: Mockify<match<IEditAttributeMatchParams>> = {params: {id: 'test_attr'}};
        const mockHistory: Mockify<History> = {};

        const comp = create(
            <ApolloProvider client={gqlClient}>
                <EditAttribute match={mockMatch as match<IEditAttributeMatchParams>} history={mockHistory as History} />
            </ApolloProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
