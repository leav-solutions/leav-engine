import {shallow} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
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
