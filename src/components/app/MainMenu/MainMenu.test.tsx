// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/react-testing';
import {shallow} from 'enzyme';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import MainMenu from './MainMenu';

describe('MainMenu', () => {
    test('Snapshot test', async () => {
        // TODO: test menu hiding if not allowed
        const comp = shallow(
            <MockedProvider>
                <MockedUserContextProvider>
                    <Router>
                        <MainMenu />
                    </Router>
                </MockedUserContextProvider>
            </MockedProvider>
        ).html();

        expect(comp).toMatchSnapshot();
    });
});
