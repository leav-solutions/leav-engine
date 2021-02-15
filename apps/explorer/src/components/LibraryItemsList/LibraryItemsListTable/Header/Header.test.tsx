// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType, OrderSearch} from '../../../../_types/types';
import {MockStateItems} from '../../../../__mocks__/stateItems/mockStateItems';
import Header from './Header';

describe('Header', () => {
    test('should display value', async () => {
        let comp: any;

        const value = 'value';

        await act(async () => {
            comp = mount(
                <MockStateItems>
                    <Header name="name" id="test" type={AttributeType.simple}>
                        {value}
                    </Header>
                </MockStateItems>
            );
        });

        expect(comp.text()).toContain(value);
    });

    test('should use WrapperArrow with the sort props desc', async () => {
        let comp: any;

        const value = 'value';

        await act(async () => {
            comp = mount(
                <MockStateItems
                    stateItems={{
                        itemsSort: {
                            field: 'id',
                            order: OrderSearch.desc,
                            active: true
                        }
                    }}
                >
                    <Header name="name" id="test" type={AttributeType.simple}>
                        {value}
                    </Header>
                </MockStateItems>
            );
        });

        expect(comp.find('WrapperArrow')).toHaveLength(1);
        expect(comp.find('WrapperArrow').prop('filterActive')).toBe(true);
        expect(comp.find('WrapperArrow').prop('filterDirection')).toBe(OrderSearch.desc);
    });

    test('should use WrapperArrow with the sort props asc', async () => {
        let comp: any;

        const value = 'value';

        await act(async () => {
            comp = mount(
                <MockStateItems
                    stateItems={{
                        itemsSort: {
                            field: 'id',
                            order: OrderSearch.asc,
                            active: true
                        }
                    }}
                >
                    <Header name="name" id="test" type={AttributeType.simple}>
                        {value}
                    </Header>
                </MockStateItems>
            );
        });

        expect(comp.find('WrapperArrow')).toHaveLength(1);
        expect(comp.find('WrapperArrow').prop('filterActive')).toBe(true);
        expect(comp.find('WrapperArrow').prop('filterDirection')).toBe(OrderSearch.asc);
    });
});
