import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import Filters from './Filters';

describe('Filters', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <Filters showFilters={false} setShowFilters={jest.fn()} libId="test" libQueryName="test" />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
