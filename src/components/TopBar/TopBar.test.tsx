// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import TopBar from './TopBar';

jest.mock(
    '../HeaderNotification',
    () =>
        function HeaderNotification() {
            return <div>HeaderNotification</div>;
        }
);

describe('TopBar', () => {
    test('should display HeaderNotification', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <TopBar
                        sideBarVisible={false}
                        userPanelVisible={false}
                        toggleSidebarVisible={jest.fn()}
                        toggleUserPanelVisible={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('HeaderNotification')).toHaveLength(1);
    });
});
