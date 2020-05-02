import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import LibraryDetailWrapper from './LibraryDetailWrapper';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test'})),
    useHistory: jest.fn
}));

describe('LibraryDetailWrapper', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <LibraryDetailWrapper />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
