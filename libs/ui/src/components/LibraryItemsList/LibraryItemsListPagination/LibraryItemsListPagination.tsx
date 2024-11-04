// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Pagination} from 'antd';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {SearchActionTypes} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';

function LibraryItemsListPagination(): JSX.Element {
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const setPagination = (current: number, size: number) => {
        searchDispatch({type: SearchActionTypes.SET_PAGINATION, page: size});
    };

    const setOffset = (page: number, pageSize: number) => {
        searchDispatch({type: SearchActionTypes.SET_OFFSET, offset: (page - 1) * (pageSize ?? 0)});
    };

    const currentPage = searchState.offset / searchState.pagination + 1;
    const paginationOptions = [5, 10, 20, 50, 100];

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
