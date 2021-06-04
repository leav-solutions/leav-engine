// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {SortOrder, ViewTypes} from '_gqlTypes/globalTypes';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {IGetViewListElement} from '../../../graphQL/queries/views/getViewsListQuery';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import View from './View';

describe('View', () => {
    const mockView: IGetViewListElement = {
        id: '0',
        label: {en: 'My view list 1', fr: 'My view list 1'},
        type: ViewTypes.list,
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
            order: SortOrder.asc
        }
    };

    test('should show view label', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore>
                        <View view={mockView} onRename={jest.fn()} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain(mockView.label.en);
    });
});
