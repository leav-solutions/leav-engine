import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Home from './Home';

describe('Home', () => {
    test('Should display home title', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <Home />
            </MockedProviderWithFragments>
        );

        expect(comp.text()).toContain('home.title');
    });
});
