// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen, waitFor, act} from '_tests/testUtils';
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
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <TopBar userPanelVisible={false} toggleUserPanelVisible={jest.fn()} nbNotifs={0} />
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByText('HeaderInfo')).toBeInTheDocument();
    });
});
