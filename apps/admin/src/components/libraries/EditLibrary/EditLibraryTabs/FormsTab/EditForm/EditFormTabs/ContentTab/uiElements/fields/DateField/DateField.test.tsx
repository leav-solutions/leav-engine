// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import DateField from './DateField';
import MockedLangContextProvider from '__mocks__/MockedLangContextProvider';
import {render as renderWithProviders, screen} from '../../../../../../../../../../../_tests/testUtils';

describe('DateField', () => {
    it('should display datefield with specified fr label', async () => {
        const label = {
            fr: 'tata',
            en: 'toto'
        };
        renderWithProviders(
            <MockedLangContextProvider>
                <DateField settings={{label}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.fr)).toBeVisible();
        expect(screen.getByText(label.fr).parentElement).not.toHaveClass('required');
    });

    it('should display datefield with fallback lang label', async () => {
        const label = {
            en: 'toto'
        };
        renderWithProviders(
            <MockedLangContextProvider>
                <DateField settings={{label}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.en)).toBeVisible();
        expect(screen.getByText(label.en).parentElement).not.toHaveClass('required');
    });

    test('Display date field', async () => {
        const comp = render(
            <div>
                <MockedLangContextProvider>
                    <DateField settings={{}} />
                </MockedLangContextProvider>
            </div>
        );

        expect(comp.find('[data-test-id="date-field"]')).toHaveLength(1);
        expect(comp.find('[data-test-id="time-field"]')).toHaveLength(0);
    });

    test('If withTime is true, display date and time field', async () => {
        const comp = render(
            <div>
                <MockedLangContextProvider>
                    <DateField settings={{withTime: true}} />
                </MockedLangContextProvider>
            </div>
        );

        expect(comp.find('[data-test-id="date-field"]')).toHaveLength(1);
        expect(comp.find('[data-test-id="time-field"]')).toHaveLength(1);
    });
});
