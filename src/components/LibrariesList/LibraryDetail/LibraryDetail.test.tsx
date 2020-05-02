import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import LibraryDetail from './LibraryDetail';

jest.mock('react-router-dom');

describe('LibraryDetail', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <LibraryDetail libId="test" libQueryName="test" />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
