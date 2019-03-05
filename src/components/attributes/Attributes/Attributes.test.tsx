import {render} from 'enzyme';
import {History} from 'history';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {BrowserRouter as Router} from 'react-router-dom';
import {Mockify} from '../../../_types/Mockify';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
// import {Mockify} from '../../../_types//Mockify';
import Attributes from './Attributes';

describe('Attributes', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};
        const comp = render(
            <MockedProvider>
                <MockedUserContextProvider>
                    <Router>
                        <Attributes history={mockHistory as History} />
                    </Router>
                </MockedUserContextProvider>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
