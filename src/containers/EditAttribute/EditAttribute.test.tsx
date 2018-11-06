import {History} from 'history';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {match} from 'react-router';
import {create} from 'react-test-renderer';
import {Mockify} from '../../_types/Mockify';
import EditAttribute, {IEditAttributeMatchParams} from './EditAttribute';

describe('EditAttribute', () => {
    test('Snapshot test', async () => {
        const mockMatch: Mockify<match<IEditAttributeMatchParams>> = {params: {id: 'test_attr'}};
        const mockHistory: Mockify<History> = {};

        const comp = create(
            <MockedProvider>
                <EditAttribute match={mockMatch as match<IEditAttributeMatchParams>} history={mockHistory as History} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
