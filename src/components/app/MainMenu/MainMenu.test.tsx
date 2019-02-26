import {shallow} from 'enzyme';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import MainMenu from './MainMenu';

describe('MainMenu', () => {
    test('Snapshot test', async () => {
        const comp = shallow(
            <Router>
                <MainMenu />
            </Router>
        ).html();

        expect(comp).toMatchSnapshot();
    });
});
