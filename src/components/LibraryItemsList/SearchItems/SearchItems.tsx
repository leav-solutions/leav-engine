import {Input} from 'antd';
import React, {useState} from 'react';
import {ConditionFilter, IQueryFilter} from '../../../_types/types';
import {LibraryItemListReducerAction, LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';

interface ISearchItemsProps {
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function SearchItems({dispatchItems}: ISearchItemsProps): JSX.Element {
    const [search, setSearch] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearch = event.target.value;
        if (newSearch === '') {
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_QUERY_FILTERS,
                queryFilters: []
            });
        } else {
            setSearch(newSearch);
        }
    };

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const searchQuery: IQueryFilter[] = [{field: 'id', value: search, condition: ConditionFilter.contains}];

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_QUERY_FILTERS,
            queryFilters: searchQuery
        });
    };

    return (
        <form onSubmit={handleSearch}>
            <Input.Search value={search} onChange={e => handleChange(e)} />
        </form>
    );
}

export default SearchItems;
