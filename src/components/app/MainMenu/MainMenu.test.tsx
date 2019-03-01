import {shallow} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {BrowserRouter as Router} from 'react-router-dom';
import MainMenu from './MainMenu';

describe('MainMenu', () => {
    test('Snapshot test', async () => {
        // TODO: test menu hiding if not allowed
        const comp = shallow(
            <MockedProvider>
                <Router>
                    <MainMenu />
                </Router>
            </MockedProvider>
        ).html();

        expect(comp).toMatchSnapshot();
    });
});
