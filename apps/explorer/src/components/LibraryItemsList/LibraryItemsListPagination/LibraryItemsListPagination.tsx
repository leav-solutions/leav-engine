// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Pagination} from 'antd';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React from 'react';
import {paginationOptions} from '../../../utils';

function LibraryItemsListPagination(): JSX.Element {
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const setPagination = (current: number, size: number) => {
        searchDispatch({type: SearchActionTypes.SET_PAGINATION, page: size});
    };

    const setOffset = (page: number, pageSize: number) => {
        searchDispatch({type: SearchActionTypes.SET_OFFSET, offset: (page - 1) * (pageSize ?? 0)});
    };

    const currentPage = searchState.offset / searchState.pagination + 1;

    return (
        <Pagination
            defaultCurrent={currentPage}
            current={currentPage}
            total={searchState.totalCount}
            defaultPageSize={searchState.pagination}
            onShowSizeChange={setPagination}
            showSizeChanger
            pageSizeOptions={paginationOptions.map(option => option.toString())}
            onChange={setOffset}
        />
    );
}

export default LibraryItemsListPagination;
