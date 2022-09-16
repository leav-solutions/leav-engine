// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import TopBar from './TopBar';

jest.mock(
    '../HeaderInfo',
    () =>
        function HeaderInfo() {
            return <div>HeaderInfo</div>;
        }
);

describe('TopBar', () => {
    test('should display HeaderInfo', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <TopBar
                        notifsPanelVisible={false}
                        userPanelVisible={false}
                        toggleUserPanelVisible={jest.fn()}
                        toggleNotifsPanelVisible={jest.fn()}
                        nbNotifs={0}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('HeaderInfo')).toHaveLength(1);
    });
});
