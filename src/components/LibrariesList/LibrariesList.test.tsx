import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import LibrariesList from './LibrariesList';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test'}))
}));

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
