// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {render} from 'enzyme';
import React from 'react';
import MockedLangContextProvider from '../../../__mocks__/MockedLangContextProvider';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import EditLibrary from './EditLibrary';

describe('EditLibrary', () => {
    test('Snapshot test', async () => {
        const mockMatch: any = {params: {id: 'test'}};

        const comp = render(
            <MockedProvider>
                <MockedLangContextProvider>
                    <MockedUserContextProvider>
                        <EditLibrary match={mockMatch} />
                    </MockedUserContextProvider>
                </MockedLangContextProvider>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
