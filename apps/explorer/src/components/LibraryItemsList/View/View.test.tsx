// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IGetViewListElement} from '../../../queries/views/getViewsListQuery';
import {OrderSearch, ViewType} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {MockStateItems} from '../../../__mocks__/stateItems/mockStateItems';
import View from './View';

describe('View', () => {
    const mockView: IGetViewListElement = {
        id: '0',
        label: {en: 'My view list 1', fr: 'My view list 1'},
        type: ViewType.list,
        color: '#50F0C4',
        shared: false,
        created_by: {
            id: '1',
            whoAmI: {
                id: '1',
                label: {fr: 'test'},
                library: {
                    id: 'test_lib'
                }
            }
        },
        filters: [],
        sort: {
            field: 'id',
            order: OrderSearch.asc
        }
    };

    test('should show view label', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStateItems>
                        <View view={mockView} onRename={jest.fn()} />
                    </MockStateItems>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain(mockView.label.en);
    });
});
