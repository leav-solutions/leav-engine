// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/react-testing';
import React from 'react';
import {create} from 'react-test-renderer';
import {GET_LIB_BY_ID_libraries_list} from '../../../../../_gqlTypes/GET_LIB_BY_ID';
import {Mockify} from '../../../../../_types/Mockify';
import MockedLangContextProvider from '../../../../../__mocks__/MockedLangContextProvider';
import AttributesTab from './AttributesTab';

describe('AttributesTab', () => {
    test('Snapshot test', async () => {
        const lib: Mockify<GET_LIB_BY_ID_libraries_list> = {
            id: 'test_lib',
            system: false
        };
        const comp = create(
            <MockedProvider>
                <MockedLangContextProvider>
                    <AttributesTab library={lib as GET_LIB_BY_ID_libraries_list} readonly={false} />
                </MockedLangContextProvider>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
