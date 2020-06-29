import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Menu} from 'semantic-ui-react';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import TopBar from './TopBar';

describe('TopBar', () => {
    test('should display Menu', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <TopBar toggleSidebarVisible={jest.fn()} toggleUserPanelVisible={jest.fn()} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Menu)).toHaveLength(1);
    });
});
