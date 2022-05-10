// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import EditApplicationContext from 'context/EditApplicationContext';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockApplicationDetails} from '__mocks__/common/applications';
import PermissionsTab from './PermissionsTab';

jest.mock('components/permissions/DefinePermByUserGroupView', () => {
    return function DefinePermByUserGroupView() {
        return <div>DefinePermByUserGroupView</div>;
    };
});
describe('GeneralAdminPermissionsTab', () => {
    test('Render test', async () => {
        await act(async () => {
            render(
                <EditApplicationContext.Provider value={{application: mockApplicationDetails, readonly: false}}>
                    <PermissionsTab />
                </EditApplicationContext.Provider>
            );
        });

        expect(screen.getByText('DefinePermByUserGroupView')).toBeInTheDocument();
    });
});
