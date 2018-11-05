import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {BrowserRouter as Router} from 'react-router-dom';
import {create} from 'react-test-renderer';
import {Mockify} from 'src/_types/Mockify';
import Libraries from './Libraries';

describe('Libraries', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};

        const comp = create(
            <MockedProvider>
                <Router>
                    <Libraries history={mockHistory} />
                </Router>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
