import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Setting from './Setting';

describe('Setting', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <Setting />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
