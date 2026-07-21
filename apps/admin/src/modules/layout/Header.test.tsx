import {render, screen} from '../../_tests/testUtils';
import {Header} from './Header';

vi.mock('../applications-switcher/ApplicationsSwitcher', () => ({
    ApplicationsSwitcher: function ApplicationsSwitcher() {
        return <div>ApplicationsSwitcher</div>;
    },
}));

vi.mock('../switch-language/LanguageSelector', () => ({
    LanguageSelector: function LanguageSelector() {
        return <div>LanguageSelector</div>;
    },
}));

describe('Header', () => {
    test('Render logo, language selector and applications menu launcher', async () => {
        render(<Header />);

        expect(screen.getByRole('link', {name: /title/})).toBeInTheDocument();
        expect(screen.getByText('LanguageSelector')).toBeInTheDocument();
        // The applications switcher is rendered inside KitHeader's `menu` dropdown,
        // whose launcher button is always present when the `menu` slot is provided.
        expect(document.querySelector('.kit-header-menu')).toBeInTheDocument();
    });
});
