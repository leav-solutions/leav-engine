import {useLazyQuery, useQuery} from '@apollo/client';
import {Input} from 'antd';
import React, {useEffect, useState} from 'react';
import {useStateItem} from '../../../Context/StateItemsContext';
import {getActiveLibrary, IGetActiveLibrary} from '../../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {SearchFullText} from '../../../queries/searchFullText/searchFullText';
import {IItem} from '../../../_types/types';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';
import {manageItems} from '../manageItems';

function SearchItems(): JSX.Element {
    const {stateItems, dispatchItems} = useStateItem();
    const [search, setSearch] = useState<string>('');
    const [updateSearch, setUpdateSearch] = useState(false);

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const {data: dataLib} = useQuery<IGetActiveLibrary>(getActiveLibrary);
    const activeLib = dataLib?.activeLib;

    const [searchFullText, {data, called, loading, error}] = useLazyQuery(
        SearchFullText(activeLib?.gql?.type || '', stateItems.columns),
        {
            variables: {
                libId: activeLib?.id,
                search
            }
        }
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearch = event.target.value;

        setSearch(newSearch);
    };

    const handleSearch = (search: string) => {
        if (search === '') {
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_SEARCH_FULL_TEXT_ACTIVE,
                searchFullTextActive: false
            });
        } else {
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_SEARCH_FULL_TEXT_ACTIVE,
                searchFullTextActive: true
            });

            setSearch(search);
            setUpdateSearch(true);

            searchFullText();
        }
    };

    useEffect(() => {
        if (called && !loading && data && updateSearch) {
            const totalCount = data?.search?.totalCount;
            const itemsFromQuery = data?.search.list;

            const items = manageItems({items: itemsFromQuery, lang, columns: stateItems.columns});

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT,
                totalCount,
                items: (items as unknown) as IItem[]
            });

            setUpdateSearch(false);
        }
    }, [called, loading, data, updateSearch, setUpdateSearch, dispatchItems, lang, stateItems.columns]);

    if (error) {
        console.error(error);
        return <>error</>;
    }

    return (
        <>
            <Input.Search value={search} onChange={handleChange} onSearch={handleSearch} />
        </>
    );
}

export default SearchItems;
