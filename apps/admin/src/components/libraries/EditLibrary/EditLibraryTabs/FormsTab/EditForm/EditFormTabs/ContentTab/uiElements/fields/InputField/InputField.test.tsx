import InputField from './InputField';
import {render, screen} from '../../../../../../../../../../../_tests/testUtils';
import MockedLangContextProvider from '../../../../../../../../../../../__mocks__/MockedLangContextProvider';

describe('InputField', () => {
    it('should display input with fr label', async () => {
        const label = {
            fr: 'tata',
            en: 'toto',
        };
        render(
            <MockedLangContextProvider>
                <InputField settings={{label}} />
            </MockedLangContextProvider>,
        );

        expect(screen.getByText(label.fr)).toBeVisible();
        expect(screen.getByText(label.fr).parentElement).not.toHaveClass('required');
    });

    it('should display input with fallback language label', async () => {
        const label = {
            en: 'toto',
        };
        render(
            <MockedLangContextProvider>
                <InputField settings={{label}} />
            </MockedLangContextProvider>,
        );

        expect(screen.getByText(label.en)).toBeVisible();
        expect(screen.getByText(label.en).parentElement).not.toHaveClass('required');
    });
});
