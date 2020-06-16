import React, {useState} from 'react';
import {Input, InputOnChangeData} from 'semantic-ui-react';
import {IQueryFilter, whereFilter} from '../../../_types/types';

interface ISearchItemsProps {
    setQueryFilters: React.Dispatch<React.SetStateAction<IQueryFilter[] | null>>;
}

function SearchItems({setQueryFilters}: ISearchItemsProps): JSX.Element {
    const [search, setSearch] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        const newSearch = data.value;
        if (newSearch === '') {
            setQueryFilters(null);
        } else {
            setSearch(data.value ?? '');
        }
    };

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const searchQuery: IQueryFilter[] = [{field: {base: 'id'}, value: search, operator: whereFilter.contains}];
        setQueryFilters(searchQuery);
    };

    return (
        <form onSubmit={handleSearch}>
            <Input icon="search" onSubmit={handleSearch} onChange={handleChange} />
        </form>
    );
}

export default SearchItems;
