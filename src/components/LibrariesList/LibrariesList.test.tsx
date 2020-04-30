import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import LibrariesList from './LibrariesList';

describe('LibrariesList', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <LibrariesList />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
