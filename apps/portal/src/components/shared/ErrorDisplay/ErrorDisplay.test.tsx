// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import ErrorDisplay from '.';

describe('ErrorDisplay', () => {
    test('Display error', async () => {
        render(<ErrorDisplay message="my_error_message" />);

        const element = screen.getByText('my_error_message');

        expect(element).toBeInTheDocument();
    });
});
