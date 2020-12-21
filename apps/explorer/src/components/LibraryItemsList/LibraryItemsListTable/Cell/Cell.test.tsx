// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeFormat, AttributeType, IItemsColumn, PreviewSize} from '../../../../_types/types';
import Cell from './Cell';

describe('Cell', () => {
    test('should display value', async () => {
        let comp: any;

        const value = 'value';

        const mockColumn: IItemsColumn = {
            id: 'colId',
            library: 'colLib',
            type: AttributeType.simple
        };

        await act(async () => {
            comp = mount(
                <Cell
                    value={value}
                    column={mockColumn}
                    size={PreviewSize.small}
                    format={AttributeFormat.text}
                    isMultiple={false}
                />
            );
        });

        expect(comp.text()).toContain(value);
    });
});
