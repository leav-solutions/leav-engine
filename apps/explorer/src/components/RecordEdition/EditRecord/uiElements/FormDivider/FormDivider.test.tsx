// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {mockCommonFormElementProps, mockFormElementDivider} from '__mocks__/common/form';
import FormDivider from './FormDivider';

describe('FormDivider', () => {
    test('Render divider', async () => {
        render(<FormDivider {...mockCommonFormElementProps} element={mockFormElementDivider} />);

        expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    test('Render divider with title', async () => {
        render(
            <FormDivider
                {...mockCommonFormElementProps}
                element={{...mockFormElementDivider, settings: {title: 'divider title'}}}
            />
        );

        expect(screen.getByText('divider title')).toBeInTheDocument();
    });
});
