import userEvent from '@testing-library/user-event';
import * as useLang from '../../../hooks/useLang';
import {AvailableLanguage} from '../../../_gqlTypes';
import {render, screen} from '../../../_tests/testUtils';
import UserPanel from './UserPanel';

const {mockLogout} = vi.hoisted(() => ({mockLogout: vi.fn()}));
vi.mock('../../../hooks/useAuth', () => ({
    default: () => ({
        logout: mockLogout,
    }),
}));

describe('UserPanel', () => {
    beforeEach(() => vi.clearAllMocks());

    test('Should display some menu items', async () => {
        render(<UserPanel visible onHide={vi.fn()} />);

        expect(screen.getAllByRole('menuitem').length).toBeGreaterThanOrEqual(1);
    });

    test('On click on logout, log out and redirect to home', async () => {
        render(<UserPanel visible onHide={vi.fn()} />);

        const logoutLink = screen.getByRole('menuitem', {name: /logout/});

        await userEvent.click(logoutLink);

        expect(mockLogout).toHaveBeenCalled();
    });

    test('Can switch language', async () => {
        const mockUpdateLang = vi.fn();
        vi.spyOn(useLang, 'default').mockImplementation(() => ({
            lang: [AvailableLanguage.en],
            availableLangs: [AvailableLanguage.fr, AvailableLanguage.en],
            defaultLang: AvailableLanguage.en,
            setLang: mockUpdateLang,
        }));

        render(<UserPanel visible onHide={vi.fn()} />);

        expect(screen.getByRole('button', {name: /🇫🇷/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /🇬🇧/})).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', {name: /🇫🇷/}));

        expect(mockUpdateLang).toHaveBeenCalled();
    });
});
