import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {BrowserRouter as Router} from 'react-router-dom';
import {create} from 'react-test-renderer';
import Libraries from './Libraries';

describe('Libraries', () => {
    test('Snapshot test', async () => {
        const comp = create(
            <MockedProvider>
                <Router>
                    <Libraries />
                </Router>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
