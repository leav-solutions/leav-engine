import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {create} from 'react-test-renderer';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';
import {Mockify} from 'src/_types/Mockify';
import EditLibraryAttributes from './EditLibraryAttributes';

describe('EditLibraryAttributes', () => {
    test('Snapshot test', async () => {
        const lib: Mockify<GET_LIBRARIES_libraries> = {
            id: 'test_lib',
            system: false
        };
        const comp = create(
            <MockedProvider>
                <EditLibraryAttributes library={lib as GET_LIBRARIES_libraries} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
