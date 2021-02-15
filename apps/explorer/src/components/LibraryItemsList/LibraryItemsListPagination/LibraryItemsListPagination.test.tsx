// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Pagination} from 'antd';
import {mount} from 'enzyme';
import React from 'react';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import LibraryItemsListPagination from './LibraryItemsListPagination';

describe('LibraryItemsListPagination', () => {
    const stateItems = {...LibraryItemListInitialState, pagination: 5, offset: 0, itemsTotalCount: 15};

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should have pagination', async () => {
        const comp = mount(<LibraryItemsListPagination />);

        expect(comp.find(Pagination)).toHaveLength(1);
    });
});
