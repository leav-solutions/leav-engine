// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import GeneralAdminPermissionsTab from './GeneralAdminPermissionsTab';

jest.mock('components/permissions/DefinePermByUserGroupView', () => function DefinePermByUserGroupView() {
        return <div>DefinePermByUserGroupView</div>;
    });
describe('GeneralAdminPermissionsTab', () => {
    test('Render test', async () => {
        await act(async () => {
            render(<GeneralAdminPermissionsTab />);
        });

        expect(screen.getByText('DefinePermByUserGroupView')).toBeInTheDocument();
    });
});
