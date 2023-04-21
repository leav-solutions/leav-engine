// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {GET_ATTRIBUTES_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {Mockify} from '../../../_types//Mockify';
import {mockAttrSimple} from '../../../__mocks__/attributes';
import MockedLangContextProvider from '../../../__mocks__/MockedLangContextProvider';
import DeleteAttribute from './DeleteAttribute';

describe('DeleteAttribute', () => {
    test('Render delete button for system attribute', async () => {
        const attr: Mockify<GET_ATTRIBUTES_attributes_list> = {
            ...mockAttrSimple,
            system: true
        };

        await act(async () => {
            render(
                <MockedProvider>
                    <MockedLangContextProvider>
                        <DeleteAttribute attribute={attr as GET_ATTRIBUTES_attributes_list} />
                    </MockedLangContextProvider>
                </MockedProvider>
            );
        });

        expect(screen.getByRole('button')).toBeDisabled();
    });
});
