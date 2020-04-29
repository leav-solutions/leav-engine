import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Router from './Router';

describe('Router', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <Router />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
