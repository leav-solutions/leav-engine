import {LibraryBehavior, GetLibrariesDocument} from '../../../_gqlTypes';
import {render, screen} from '../../../_tests/testUtils';
import FileSelector from './FileSelector';

vi.mock('../RecordSelector', () => ({
    default: function RecordSelector() {
        return <div>RecordSelector</div>;
    },
}));

vi.mock('../../../hooks/useLang');

describe('FileSelector', () => {
    const mocks = [
        {
            request: {
                query: GetLibrariesDocument,
                variables: {
                    behavior: [LibraryBehavior.files],
                },
            },
            result: {
                data: {
                    libraries: {
                        totalCount: 1,
                        list: [
                            {
                                id: 'files',
                                system: true,
                                label: {
                                    en: 'Files',
                                    fr: 'Fichiers',
                                },
                                icon: null,
                                behavior: 'files',
                                __typename: 'Library',
                            },
                        ],
                        __typename: 'LibrariesList',
                    },
                },
            },
        },
    ];
    afterEach(() => vi.clearAllMocks());

    test('Display record selector after fetching libraries', async () => {
        render(<FileSelector onChange={vi.fn()} value={null} label="icon" />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText('RecordSelector')).toBeInTheDocument();
    });
});
