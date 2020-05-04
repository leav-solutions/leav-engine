import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import LibraryItemsList from './LibraryItemsList';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libQueryName: 'test'})),
    useHistory: jest.fn()
}));

describe('LibraryItemsList', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <LibraryItemsList />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
