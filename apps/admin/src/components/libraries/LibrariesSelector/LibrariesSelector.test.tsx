import {act, render, screen} from '../../../_tests/testUtils';
import {AvailableLanguage, GetLibrariesDocument} from '../../../_gqlTypes';
import LibrariesSelector from './LibrariesSelector';

vi.mock('../../../hooks/useLang');

vi.mock('../LibrariesSelectorField', () => ({
    default: function LibrariesSelectorField() {
        return <div>LibrariesSelectorField</div>;
    },
}));

const mockGetLibraries = {
    request: {query: GetLibrariesDocument, variables: {}},
    result: {data: {libraries: {__typename: 'LibrariesList', totalCount: 0, list: []}}},
};

describe('LibrariesSelector', () => {
    test('Snapshot test', async () => {
        await act(async () => {
            render(<LibrariesSelector lang={[AvailableLanguage.fr]} />, {apolloMocks: [mockGetLibraries]});
        });

        expect(screen.getByText('LibrariesSelectorField')).toBeInTheDocument();
    });
});
