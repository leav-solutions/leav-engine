import React from 'react';
import {act, render, screen} from '../../../_tests/testUtils';
import {type GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {type Mockify} from '../../../_types//Mockify';
import DeleteLibrary from './DeleteLibrary';

vi.mock('../../../hooks/useLang');

describe('DeleteLibrary', () => {
    test('Disable button on system lib', async () => {
        const library: Mockify<GET_LIBRARIES_libraries_list> = {
            id: 'test',
            label: {fr: 'Test', en: null},
            system: true,
        };
        await act(async () => {
            render(<DeleteLibrary library={library as GET_LIBRARIES_libraries_list} />);
        });

        expect(screen.getByRole('button')).toBeDisabled();
    });
});
