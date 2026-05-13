import {render, screen} from '../../../_tests/testUtils';
import Dashboard from './Dashboard';
import {GetStatsDocument} from '../../../_gqlTypes';

describe('Dashboard', () => {
    test('Render test', async () => {
        const mocks = [
            {
                request: {
                    query: GetStatsDocument,
                    variables: {},
                },
                result: {
                    data: {
                        libraries: {
                            totalCount: 42,
                        },
                        attributes: {
                            totalCount: 1337,
                        },
                        trees: {
                            totalCount: 38,
                        },
                        applications: {
                            totalCount: 2,
                        },
                    },
                },
            },
        ];

        render(<Dashboard />, {apolloMocks: mocks});

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
