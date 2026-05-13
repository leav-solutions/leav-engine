import React from 'react';
import {act, render, screen} from '../../../../_tests/testUtils';
import GeneralAdminPermissionsTab from './GeneralAdminPermissionsTab';

jest.mock(
    '../../../permissions/DefinePermByUserGroupView',
    () =>
        function DefinePermByUserGroupView() {
            return <div>DefinePermByUserGroupView</div>;
        },
);
describe('GeneralAdminPermissionsTab', () => {
    test('Render test', async () => {
        await act(async () => {
            render(<GeneralAdminPermissionsTab />);
        });

        expect(screen.getByText('DefinePermByUserGroupView')).toBeInTheDocument();
    });
});
