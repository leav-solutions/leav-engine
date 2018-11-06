import * as React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {create} from 'react-test-renderer';
import MainMenu from './MainMenu';

describe('MainMenu', () => {
    test('Snapshot test', async () => {
        const comp = create(
            <Router>
                <MainMenu />
            </Router>
        );

        expect(comp).toMatchSnapshot();
    });
});
