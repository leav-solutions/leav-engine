import {shallow} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import Home from './Home';

describe('Home', () => {
    test('Snapshot test', async () => {
        const comp = shallow(
            <MockedProvider>
                <Home />
            </MockedProvider>
        ).html();

        expect(comp).toMatchSnapshot();
    });
});
