// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {Mockify} from '../../../_types//Mockify';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import DeleteLibrary from './DeleteLibrary';

jest.mock('../../../hooks/useLang');

describe('DeleteLibrary', () => {
    test('Disable button on system lib', async () => {
        const library: Mockify<GET_LIBRARIES_libraries_list> = {
            id: 'test',
            label: {fr: 'Test', en: null},
            system: true
        };
        const comp = render(
            <MockedProvider>
                <MockedUserContextProvider>
                    <DeleteLibrary library={library as GET_LIBRARIES_libraries_list} />
                </MockedUserContextProvider>
            </MockedProvider>
        );

        expect(comp.find('button.delete').prop('disabled')).toBe(true);
    });
});
