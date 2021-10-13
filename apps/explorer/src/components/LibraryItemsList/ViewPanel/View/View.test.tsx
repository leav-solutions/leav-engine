// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {SortOrder, ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import View from './View';
import {IView} from '../../../../_types/types';

describe('View', () => {
    const mockView: IView = {
        id: '0',
        label: {en: 'My view list 1', fr: 'My view list 1'},
        display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
        color: '#50F0C4',
        shared: false,
        filters: [],
        owner: true,
        sort: {
            field: 'id',
            order: SortOrder.asc
        }
    };

    test('should show view label', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore>
                        <View view={mockView} onEdit={jest.fn()} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain(mockView.label.en);
    });
});
