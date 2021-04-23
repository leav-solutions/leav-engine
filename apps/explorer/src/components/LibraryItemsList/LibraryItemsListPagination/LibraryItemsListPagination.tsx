// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Pagination} from 'antd';
import React from 'react';
import {setItemsOffset, setItemsPagination} from 'redux/items';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {paginationOptions} from '../../../utils';

function LibraryItemsListPagination(): JSX.Element {
    const {items} = useAppSelector(state => state);
    const dispatch = useAppDispatch();

    const setPagination = (current: number, size: number) => {
        dispatch(setItemsPagination(size));
    };

    const setOffset = (page: number, pageSize: number) => {
        dispatch(setItemsOffset((page - 1) * (pageSize ?? 0)));
    };

    return (
        <Pagination
            defaultCurrent={items.offset / items.pagination + 1}
            total={items.totalCount}
            defaultPageSize={items.pagination}
            onShowSizeChange={setPagination}
            showSizeChanger
            pageSizeOptions={paginationOptions.map(option => option.toString())}
            onChange={setOffset}
        />
    );
}

export default LibraryItemsListPagination;
