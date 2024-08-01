// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import InputField from './InputField';
import {render, screen} from '../../../../../../../../../../../_tests/testUtils';
import MockedLangContextProvider from '__mocks__/MockedLangContextProvider';

describe('InputField', () => {
    it('should display input with fr label', async () => {
        const label = {
            fr: 'tata',
            en: 'toto'
        };
        render(
            <MockedLangContextProvider>
                <InputField settings={{label}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.fr)).toBeVisible();
        expect(screen.getByText(label.fr).parentElement).not.toHaveClass('required');
    });

    it('should display input with fallback language label', async () => {
        const label = {
            en: 'toto'
        };
        render(
            <MockedLangContextProvider>
                <InputField settings={{label}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.en)).toBeVisible();
        expect(screen.getByText(label.en).parentElement).not.toHaveClass('required');
    });

    it('should display input with required class if specified', async () => {
        const label = {
            en: 'tata'
        };
        render(
            <MockedLangContextProvider>
                <InputField settings={{label, required: true}} />
            </MockedLangContextProvider>
        );

        expect(screen.getByText(label.en).parentElement).toHaveClass('required');
    });
});
