import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {create} from 'react-test-renderer';
import {GET_LIBRARIES_libraries} from '../../_gqlTypes/GET_LIBRARIES';
import {Mockify} from '../../_types/Mockify';
import DeleteLibrary from './DeleteLibrary';

describe('DeleteLibrary', () => {
    test('Snapshot test', async () => {
        const lib: Mockify<GET_LIBRARIES_libraries> = {
            label: null
        };

        const comp = create(
            <MockedProvider>
                <DeleteLibrary library={lib as GET_LIBRARIES_libraries} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
