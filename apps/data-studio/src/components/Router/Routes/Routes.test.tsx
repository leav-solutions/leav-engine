// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MemoryRouter} from 'react-router-dom';
import {render, screen} from '_tests/testUtils';
import Routes from './Routes';

jest.mock(
    '../RouteNotFound',
    () =>
        function RouteNotFound() {
            return <div>RouteNotFound</div>;
        }
);

jest.mock('../../Workspace', () => function Workspace() {
        return <div>Workspace</div>;
    });

describe('Routes', () => {
    test('default url call Workspace', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes />
            </MemoryRouter>
        );

        expect(screen.getByText('Workspace')).toBeInTheDocument();
    });
});
