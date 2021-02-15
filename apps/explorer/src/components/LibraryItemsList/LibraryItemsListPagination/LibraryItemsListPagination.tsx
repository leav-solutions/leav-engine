// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Pagination} from 'antd';
import React from 'react';
import {useStateItem} from '../../../Context/StateItemsContext';
import {paginationOptions} from '../../../utils';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';

function LibraryItemsListPagination(): JSX.Element {
    const {stateItems, dispatchItems} = useStateItem();

    const setPagination = (current: number, size: number) => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_PAGINATION,
            pagination: size
        });
    };

    return (
        <Pagination
            defaultCurrent={stateItems.offset / stateItems.pagination + 1}
            total={stateItems.itemsTotalCount}
            defaultPageSize={stateItems.pagination}
            onShowSizeChange={setPagination}
            showSizeChanger
            pageSizeOptions={paginationOptions.map(option => option.toString())}
            onChange={(page, pageSize) =>
                dispatchItems({
                    type: LibraryItemListReducerActionTypes.SET_OFFSET,
                    offset: (page - 1) * (pageSize ?? 0)
                })
            }
        />
    );
}

export default LibraryItemsListPagination;
