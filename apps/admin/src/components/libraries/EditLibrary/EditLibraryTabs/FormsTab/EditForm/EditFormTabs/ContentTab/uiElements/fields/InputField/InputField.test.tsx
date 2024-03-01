// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import InputField from './InputField';
import {render, screen} from '../../../../../../../../../../../_tests/testUtils';

describe('InputField', () => {
    it('should display input with specified label', async () => {
        const label = 'toto';
        render(<InputField settings={{label}} />);

        expect(screen.getByText(label)).toBeVisible();
        expect(screen.getByText(label).parentElement).not.toHaveClass('required');
    });

    it('should display input with required class if specified', async () => {
        const label = 'tata';
        render(<InputField settings={{label, required: true}} />);

        expect(screen.getByText(label).parentElement).toHaveClass('required');
    });
});
