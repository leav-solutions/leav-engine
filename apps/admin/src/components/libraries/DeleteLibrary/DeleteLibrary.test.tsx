// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {Mockify} from '../../../_types//Mockify';
import DeleteLibrary from './DeleteLibrary';

jest.mock('../../../hooks/useLang');

describe('DeleteLibrary', () => {
    test('Disable button on system lib', async () => {
        const library: Mockify<GET_LIBRARIES_libraries_list> = {
            id: 'test',
            label: {fr: 'Test', en: null},
            system: true
        };
        await act(async () => {
            render(<DeleteLibrary library={library as GET_LIBRARIES_libraries_list} />);
        });

        expect(screen.getByRole('button')).toBeDisabled();
    });
});
