// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/react-testing';
import {shallow} from 'enzyme';
import React from 'react';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import Home from './Home';

describe('Home', () => {
    test('Snapshot test', async () => {
        const comp = shallow(
            <MockedProvider>
                <MockedUserContextProvider>
                    <Home />
                </MockedUserContextProvider>
            </MockedProvider>
        )
            .find('Home')
            .shallow();

        expect(comp.find('MainMenu')).toHaveLength(1);
        expect(comp.find('ProtectedRoute')).toHaveLength(8);
    });
});
