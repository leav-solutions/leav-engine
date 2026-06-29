import {act, render, screen} from '../../../../_tests/testUtils';
import GeneralAdminPermissionsTab from './GeneralAdminPermissionsTab';

vi.mock('../../../permissions/DefinePermByUserGroupView', () => ({
    default: function DefinePermByUserGroupView() {
        return <div>DefinePermByUserGroupView</div>;
    },
}));
describe('GeneralAdminPermissionsTab', () => {
    test('Render test', async () => {
        await act(async () => {
            render(<GeneralAdminPermissionsTab />);
        });

        expect(screen.getByText('DefinePermByUserGroupView')).toBeInTheDocument();
    });
});
