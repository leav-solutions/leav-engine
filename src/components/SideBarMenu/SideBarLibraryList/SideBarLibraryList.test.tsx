import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import SideBarLibraryList from './SideBarLibraryList';

describe('SideBarLibraryList', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <SideBarLibraryList hide={jest.fn()} />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
