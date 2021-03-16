// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeFormat, AttributeType, ITableItem} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import Cell from './Cell';

describe('Cell', () => {
    test('should display value', async () => {
        let comp: any;

        const mockData = {
            id: 'id',
            value: 'value',
            type: AttributeType.simple,
            format: AttributeFormat.text
        };

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <Cell columnName="test" data={(mockData as unknown) as ITableItem} index="0" />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain(mockData.value);
    });
});
