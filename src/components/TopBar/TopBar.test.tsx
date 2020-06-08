import {mount, render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Menu} from 'semantic-ui-react';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import TopBar from './TopBar';

describe('TopBar', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <TopBar toggleSidebarVisible={jest.fn()} />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });

    test('should display Menu', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <TopBar toggleSidebarVisible={jest.fn()} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Menu)).toHaveLength(1);
    });
});
