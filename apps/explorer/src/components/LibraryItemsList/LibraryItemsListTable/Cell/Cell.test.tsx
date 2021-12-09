// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {act, render, screen} from '_tests/testUtils';
import {ITableCell} from '../../../../_types/types';
import Cell from './Cell';

describe('Cell', () => {
    test('should display value', async () => {
        const mockData = {
            id: 'id',
            value: 'value',
            type: AttributeType.simple,
            format: AttributeFormat.text
        };

        await act(async () => {
            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} />);
        });

        expect(screen.getByText(mockData.value)).toBeInTheDocument();
    });
});
