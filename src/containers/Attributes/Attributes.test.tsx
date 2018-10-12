import {History} from 'history';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {BrowserRouter as Router} from 'react-router-dom';
import {create} from 'react-test-renderer';
import {Mockify} from '../../_types/Mockify';
import Attributes from './Attributes';

describe('Attributes', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};
        const comp = create(
            <MockedProvider>
                <Router>
                    <Attributes history={mockHistory as History} />
                </Router>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
