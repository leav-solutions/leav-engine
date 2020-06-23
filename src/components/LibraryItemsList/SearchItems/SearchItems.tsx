import React, {useState} from 'react';
import {Input, InputOnChangeData} from 'semantic-ui-react';
import {conditionFilter, IQueryFilter} from '../../../_types/types';
import {LibraryItemListReducerAction, LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';

interface ISearchItemsProps {
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function SearchItems({dispatchItems}: ISearchItemsProps): JSX.Element {
    const [search, setSearch] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        const newSearch = data.value;
        if (newSearch === '') {
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_QUERY_FILTERS,
                queryFilters: []
            });
        } else {
            setSearch(data.value ?? '');
        }
    };

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const searchQuery: IQueryFilter[] = [{field: {base: 'id'}, value: search, condition: conditionFilter.contains}];

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_QUERY_FILTERS,
            queryFilters: searchQuery
        });
    };

    return (
        <form onSubmit={handleSearch}>
            <Input icon="search" onSubmit={handleSearch} onChange={handleChange} />
        </form>
    );
}

export default SearchItems;
