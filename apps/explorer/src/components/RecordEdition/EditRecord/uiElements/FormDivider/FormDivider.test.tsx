// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {mockFormElementDivider} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import FormDivider from './FormDivider';

describe('FormDivider', () => {
    test('Render divider', async () => {
        render(<FormDivider record={mockRecordWhoAmI} element={mockFormElementDivider} recordValues={{}} />);

        expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    test('Render divider with title', async () => {
        render(
            <FormDivider
                record={mockRecordWhoAmI}
                element={{...mockFormElementDivider, settings: {title: 'divider title'}}}
                recordValues={{}}
            />
        );

        expect(screen.getByText('divider title')).toBeInTheDocument();
    });
});
