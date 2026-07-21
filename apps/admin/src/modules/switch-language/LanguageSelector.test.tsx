import userEvent from '@testing-library/user-event';
import {render, screen} from '../../_tests/testUtils';
import {LanguageSelector} from './LanguageSelector';

describe('LanguageSelector', () => {
    test('Render a select with the available languages', async () => {
        render(<LanguageSelector />);

        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();

        await userEvent.click(select);

        // Options are built from availableLangs ([fr, en]), displayed uppercased
        expect(await screen.findByText('EN')).toBeInTheDocument();
    });
});
