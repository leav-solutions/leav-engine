// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import CheckboxField from './CheckboxField';
import {render, screen} from '../../../../../../../../../../../_tests/testUtils';
import MockedLangContextProvider from '__mocks__/MockedLangContextProvider';

describe('CheckboxField', () => {
    it('should display checkbox with fr label', async () => {
        const label = {
            fr: 'tata',
            en: 'toto'
        };
        render(
            <MockedLangContextProvider>
                <CheckboxField settings={{label}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.fr)).toBeVisible();
        expect(screen.getByText(label.fr).parentElement).not.toHaveClass('required');
    });

    it('should display checkbox with fallback lang label', async () => {
        const label = {
            en: 'toto'
        };
        render(
            <MockedLangContextProvider>
                <CheckboxField settings={{label}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.en)).toBeVisible();
        expect(screen.getByText(label.en).parentElement).not.toHaveClass('required');
    });

    test('Snapshot test', async () => {
        const comp = render(
            <MockedLangContextProvider>
                <CheckboxField settings={{}} />
            </MockedLangContextProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
