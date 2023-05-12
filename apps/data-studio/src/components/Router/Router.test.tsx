// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '_tests/testUtils';
import Router from './Router';

jest.mock(
    '../TopBar',
    () =>
        function TopBar() {
            return <div>TopBar</div>;
        }
);

jest.mock(
    '../Sidebar',
    () =>
        function Sidebar() {
            return <div>Sidebar</div>;
        }
);

jest.mock(
    '../UserPanel',
    () =>
        function UserPanel() {
            return <div>UserPanel</div>;
        }
);

jest.mock(
    '../NotifsPanel',
    () =>
        function NotifsPanel() {
            return <div>NotifsPanel</div>;
        }
);

jest.mock('./Routes', () => {
    return function Routes() {
        return <div>Routes</div>;
    };
});

jest.mock('reduxStore/notifications', () => jest.fn());

jest.mock('../../constants', () => ({
    APPS_ENDPOINT: '',
    APP_ENDPOINT: ''
}));

describe('Router', () => {
    test('Should add a router and layout elements', async () => {
        await act(async () => {
            render(<Router />);
        });

        expect(screen.getByText('Routes')).toBeInTheDocument();
        expect(screen.getByText('Sidebar')).toBeInTheDocument();
        expect(screen.getByText('TopBar')).toBeInTheDocument();
        expect(screen.getByText('UserPanel')).toBeInTheDocument();
        expect(screen.getByText('NotifsPanel')).toBeInTheDocument();
    });
});
