// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
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
        await act(async () => {
            render(<TopBar userPanelVisible={false} toggleUserPanelVisible={jest.fn()} />);
        });

        expect(screen.getByText('HeaderNotification')).toBeInTheDocument();
    });
});
