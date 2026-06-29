import EditApplicationContext from '../../../../../context/EditApplicationContext';
import {act, render, screen} from '../../../../../_tests/testUtils';
import {mockApplicationDetails} from '../../../../../__mocks__/common/applications';
import PermissionsTab from './PermissionsTab';

vi.mock('../../../../permissions/DefinePermByUserGroupView', () => ({
    default: function DefinePermByUserGroupView() {
        return <div>DefinePermByUserGroupView</div>;
    },
}));
describe('GeneralAdminPermissionsTab', () => {
    test('Render test', async () => {
        await act(async () => {
            render(
                <EditApplicationContext.Provider value={{application: mockApplicationDetails, readonly: false}}>
                    <PermissionsTab />
                </EditApplicationContext.Provider>,
            );
        });

        expect(screen.getByText('DefinePermByUserGroupView')).toBeInTheDocument();
    });
});
