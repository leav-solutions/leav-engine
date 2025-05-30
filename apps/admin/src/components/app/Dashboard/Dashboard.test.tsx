// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getStatsQuery} from 'queries/stats/getStatsQuery';
import {MemoryRouter} from 'react-router-dom-v5';
import {render, screen} from '_tests/testUtils';
import Dashboard from './Dashboard';

describe('Dashboard', () => {
    test('Render test', async () => {
        const mocks = [
            {
                request: {
                    query: getStatsQuery,
                    variables: {}
                },
                result: {
                    data: {
                        libraries: {
                            totalCount: 42
                        },
                        attributes: {
                            totalCount: 1337
                        },
                        trees: {
                            totalCount: 38
                        },
                        applications: {
                            totalCount: 2
                        }
                    }
                }
            }
        ];

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>,
            {apolloMocks: mocks}
        );

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText(/libraries/)).toBeInTheDocument();
        expect(await screen.findByText('42')).toBeInTheDocument();
        expect(await screen.findByText(/attributes/)).toBeInTheDocument();
        expect(await screen.findByText('1337')).toBeInTheDocument();
        expect(await screen.findByText(/trees/)).toBeInTheDocument();
        expect(await screen.findByText('38')).toBeInTheDocument();
        expect(await screen.findByText(/applications/)).toBeInTheDocument();
        expect(await screen.findByText('2')).toBeInTheDocument();
    });
});
