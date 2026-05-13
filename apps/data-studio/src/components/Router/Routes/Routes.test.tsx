import {MemoryRouter} from 'react-router-dom';
import {render, screen} from '../../../_tests/testUtils';
import Routes from './Routes';

jest.mock(
    '../RouteNotFound',
    () =>
        function RouteNotFound() {
            return <div>RouteNotFound</div>;
        },
);

jest.mock(
    '../../Workspace',
    () =>
        function Workspace() {
            return <div>Workspace</div>;
        },
);

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
