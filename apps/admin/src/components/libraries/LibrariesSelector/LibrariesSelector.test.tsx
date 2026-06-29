import {act, render, screen} from '../../../_tests/testUtils';
import {AvailableLanguage} from '../../../_gqlTypes';
import LibrariesSelector from './LibrariesSelector';

vi.mock('../../../hooks/useLang');

vi.mock('../LibrariesSelectorField', () => ({
    default: function LibrariesSelectorField() {
        return <div>LibrariesSelectorField</div>;
    },
}));

describe('LibrariesSelector', () => {
    test('Snapshot test', async () => {
        await act(async () => {
            render(<LibrariesSelector lang={[AvailableLanguage.fr]} />);
        });

        expect(screen.getByText('LibrariesSelectorField')).toBeInTheDocument();
    });
});
