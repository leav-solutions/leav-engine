import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import AppHandler from './AppHandler';

describe('AppHandler', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <AppHandler />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
