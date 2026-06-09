import userEvent from '@testing-library/user-event';
import {act, render, screen} from '../../../_tests/testUtils';
import General from './General';

vi.mock('./GeneralInfosTab', () => ({
    default: function GeneralInfosTab() {
        return <div>GeneralInfosTab</div>;
    },
}));

vi.mock('./GeneralAdminPermissionsTab', () => ({
    default: function GeneralAdminPermissionsTab() {
        return <div>GeneralAdminPermissionsTab</div>;
    },
}));

vi.mock('./GeneralApiKeysTab', () => ({
    default: function GeneralApiKeysTab() {
        return <div>GeneralApiKeysTab</div>;
    },
}));

vi.mock('./GeneralCustomConfigTab', () => ({
    default: function GeneralCustomConfigTab() {
        return <div>GeneralCustomConfigTab</div>;
    },
}));

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual<object>('react-router-dom')),
    useLocation: () => ({hash: ''}),
}));

describe('General', () => {
    test('Render test', async () => {
        render(<General />);

        expect(screen.getByText('GeneralInfosTab')).toBeInTheDocument();

        const adminTabLink = screen.getByText(/admin_permissions/);
        const apiKeysTabLink = screen.getByText(/api_keys/);

        await userEvent.click(adminTabLink);

        expect(screen.getByText('GeneralAdminPermissionsTab')).toBeInTheDocument();

        await userEvent.click(apiKeysTabLink);

        expect(screen.getByText('GeneralApiKeysTab')).toBeInTheDocument();
    });
});
