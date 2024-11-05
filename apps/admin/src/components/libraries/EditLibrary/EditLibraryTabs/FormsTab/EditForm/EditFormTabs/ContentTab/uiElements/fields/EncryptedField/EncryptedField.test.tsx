// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import EncryptedField from './EncryptedField';
import MockedLangContextProvider from '__mocks__/MockedLangContextProvider';
import {render, screen} from '../../../../../../../../../../../_tests/testUtils';

describe('EncryptedField', () => {
    it('should display encrypted field with fr label', async () => {
        const label = {
            fr: 'tata',
            en: 'toto'
        };
        render(
            <MockedLangContextProvider>
                <EncryptedField settings={{label}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.fr)).toBeVisible();
        expect(screen.getByText(label.fr).parentElement).not.toHaveClass('required');
    });

    it('should display encrypted field with fallback lang label', async () => {
        const label = {
            en: 'toto'
        };
        render(
            <MockedLangContextProvider>
                <EncryptedField settings={{label}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.en)).toBeVisible();
        expect(screen.getByText(label.en).parentElement).not.toHaveClass('required');
    });

    test('Snapshot test', async () => {
        const comp = render(
            <MockedLangContextProvider>
                <EncryptedField settings={{}} />
            </MockedLangContextProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
