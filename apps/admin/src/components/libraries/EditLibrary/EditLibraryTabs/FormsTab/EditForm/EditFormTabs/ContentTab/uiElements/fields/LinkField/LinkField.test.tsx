import LinkField from './LinkField';
import {render, screen} from '../../../../../../../../../../../_tests/testUtils';
import MockedLangContextProvider from '../../../../../../../../../../../__mocks__/MockedLangContextProvider';

describe('LinkField', () => {
    it('should display input with fr label', async () => {
        const label = {fr: 'tata', en: 'toto'};
        render(
            <MockedLangContextProvider>
                <LinkField settings={{label}} />
            </MockedLangContextProvider>,
        );

        expect(screen.getByText(label.fr)).toBeVisible();
        expect(screen.getByText(label.fr)).not.toHaveClass('required');
    });

    it('should display input with fallback lang label', async () => {
        const label = {en: 'toto'};
        render(
            <MockedLangContextProvider>
                <LinkField settings={{label}} />
            </MockedLangContextProvider>,
        );

        expect(screen.getByText(label.en)).toBeVisible();
    });
});
