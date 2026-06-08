import {MemoryRouter} from 'react-router-dom';
import {render, screen} from '../../../_tests/testUtils';
import Routes from './Routes';

vi.mock('../RouteNotFound', () => ({
    default: function RouteNotFound() {
        return <div>RouteNotFound</div>;
    },
}));

vi.mock('../../Workspace', () => ({
    default: function Workspace() {
        return <div>Workspace</div>;
    },
}));

describe('Routes', () => {
    test('default url call Workspace', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes />
            </MemoryRouter>,
        );

        expect(screen.getByText('Workspace')).toBeInTheDocument();
    });
});
