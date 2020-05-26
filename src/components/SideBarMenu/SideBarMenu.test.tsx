import {render} from 'enzyme';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import SideBarMenu from './SideBarMenu';

describe('SideBarMenu', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <BrowserRouter>
                    <SideBarMenu visible={true} hide={jest.fn()} />
                </BrowserRouter>
            </MockedProviderWithFragments>
        );

        expect(comp).toBeTruthy();
    });
});
