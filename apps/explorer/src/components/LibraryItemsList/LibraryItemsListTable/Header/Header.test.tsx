// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {itemsInitialState} from 'redux/items';
import {SortOrder} from '_gqlTypes/globalTypes';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {AttributeType, OrderSearch} from '../../../../_types/types';
import Header from './Header';

describe('Header', () => {
    test('should display value', async () => {
        let comp: any;

        const value = 'value';

        await act(async () => {
            comp = mount(
                <MockStore>
                    <Header name="name" id="test" type={AttributeType.simple}>
                        {value}
                    </Header>
                </MockStore>
            );
        });

        expect(comp.text()).toContain(value);
    });

    test('should use WrapperArrow with the sort props desc', async () => {
        let comp: any;

        const value = 'value';

        const stateMock = {
            items: {
                ...itemsInitialState,
                sort: {
                    field: 'id',
                    order: SortOrder.desc,
                    active: true
                }
            }
        };

        await act(async () => {
            comp = mount(
                <MockStore state={stateMock}>
                    <Header name="name" id="test" type={AttributeType.simple}>
                        {value}
                    </Header>
                </MockStore>
            );
        });

        expect(comp.find('WrapperArrow')).toHaveLength(1);
        expect(comp.find('WrapperArrow').prop('filterActive')).toBe(true);
        expect(comp.find('WrapperArrow').prop('filterDirection')).toBe(OrderSearch.desc);
    });

    test('should use WrapperArrow with the sort props asc', async () => {
        let comp: any;

        const value = 'value';

        const stateMock = {
            items: {
                ...itemsInitialState,
                sort: {
                    field: 'id',
                    order: SortOrder.asc,
                    active: true
                }
            }
        };

        await act(async () => {
            comp = mount(
                <MockStore state={stateMock}>
                    <Header name="name" id="test" type={AttributeType.simple}>
                        {value}
                    </Header>
                </MockStore>
            );
        });

        expect(comp.find('WrapperArrow')).toHaveLength(1);
        expect(comp.find('WrapperArrow').prop('filterActive')).toBe(true);
        expect(comp.find('WrapperArrow').prop('filterDirection')).toBe(OrderSearch.asc);
    });
});
