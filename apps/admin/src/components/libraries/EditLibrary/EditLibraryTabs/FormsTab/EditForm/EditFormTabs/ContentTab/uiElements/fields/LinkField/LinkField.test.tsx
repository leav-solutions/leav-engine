// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import LinkField from './LinkField';
import {render, screen} from '../../../../../../../../../../../_tests/testUtils';
import MockedLangContextProvider from '__mocks__/MockedLangContextProvider';

describe('LinkField', () => {
    it('should display input with fr label', async () => {
        const label = {fr: 'tata', en: 'toto'};
        render(
            <MockedLangContextProvider>
                <LinkField settings={{label}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.fr)).toBeVisible();
        expect(screen.getByText(label.fr)).not.toHaveClass('required');
    });

    it('should display input with fallback lang label', async () => {
        const label = {en: 'toto'};
        render(
            <MockedLangContextProvider>
                <LinkField settings={{label}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.en)).toBeVisible();
        expect(screen.getByText(label.en)).not.toHaveClass('required');
    });

    it('should display input with required class if specified', async () => {
        const label = {en: 'tata'};
        render(
            <MockedLangContextProvider>
                <LinkField settings={{label, required: true}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.en)).toHaveClass('required');
    });
});
