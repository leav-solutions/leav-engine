import {render, screen} from '../../_tests/testUtils';
import Router from './Router';

vi.mock('../TopBar', () => ({
    default: function TopBar() {
        return <div>TopBar</div>;
    },
}));

vi.mock('../Sidebar', () => ({
    default: function Sidebar() {
        return <div>Sidebar</div>;
    },
}));

vi.mock('../UserPanel', () => ({
    default: function UserPanel() {
        return <div>UserPanel</div>;
    },
}));

vi.mock('../NotifsPanel', () => ({
    default: function NotifsPanel() {
        return <div>NotifsPanel</div>;
    },
}));

vi.mock('./Routes', () => ({
    default: function Routes() {
        return <div>Routes</div>;
    },
}));

vi.mock('../../reduxStore/notifications', async importOriginal => ({
    ...(await importOriginal<object>()),
    default: vi.fn(),
}));

vi.mock('../../constants', async importOriginal => ({
    ...(await importOriginal<object>()),
    APP_BASE_URL: '',
}));

describe('Router', () => {
    test('Should add a router and layout elements', async () => {
        render(<Router />);

        expect(screen.getByText('Routes')).toBeInTheDocument();
        expect(screen.getByText('Sidebar')).toBeInTheDocument();
        expect(screen.getByText('TopBar')).toBeInTheDocument();
        expect(screen.getByText('UserPanel')).toBeInTheDocument();
        expect(screen.getByText('NotifsPanel')).toBeInTheDocument();
    });
});
