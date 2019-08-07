import {MockedProvider} from '@apollo/react-testing';
import React from 'react';
import {create} from 'react-test-renderer';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {Mockify} from '../../../_types//Mockify';
import MockedLangContextProvider from '../../../__mocks__/MockedLangContextProvider';
import EditLibraryAttributes from './EditLibraryAttributes';

describe('EditLibraryAttributes', () => {
    test('Snapshot test', async () => {
        const lib: Mockify<GET_LIBRARIES_libraries_list> = {
            id: 'test_lib',
            system: false
        };
        const comp = create(
            <MockedProvider>
                <MockedLangContextProvider>
                    <EditLibraryAttributes library={lib as GET_LIBRARIES_libraries_list} readOnly={false} />
                </MockedLangContextProvider>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
