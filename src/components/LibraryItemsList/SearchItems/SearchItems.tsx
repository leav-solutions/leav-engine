import {CloseOutlined} from '@ant-design/icons';
import {useLazyQuery, useQuery} from '@apollo/client';
import {Input, Tooltip} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useStateItem} from '../../../Context/StateItemsContext';
import {getActiveLibrary, IGetActiveLibrary} from '../../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {SearchFullText} from '../../../queries/searchFullText/searchFullText';
import {IItem} from '../../../_types/types';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';
import {manageItems} from '../manageItems';

function SearchItems(): JSX.Element {
    const {stateItems, dispatchItems} = useStateItem();

    const {t} = useTranslation();

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
            resetSearch();
        } else {
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_SEARCH_FULL_TEXT_ACTIVE,
                searchFullTextActive: true
            });

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_OFFSET,
                offset: 0
            });

            setSearch(search);
            setUpdateSearch(true);

            searchFullText();
        }
    };

    // reload query when columns change
    useEffect(() => {
        if (stateItems.searchFullTextActive) {
            setUpdateSearch(true);
            searchFullText();
        }
    }, [setUpdateSearch, searchFullText, stateItems.columns, stateItems.searchFullTextActive]);

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

    const resetSearch = () => {
        setSearch('');
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SEARCH_FULL_TEXT_ACTIVE,
            searchFullTextActive: false
        });
    };

    return (
        <div style={{width: '20rem', display: 'flex'}}>
            <Input.Search
                placeholder={t('search.placeholder')}
                value={search}
                onChange={handleChange}
                onSearch={handleSearch}
                suffix={
                    search && (
                        <Tooltip placement="bottom" title={t('search.explain-cancel')}>
                            <CloseOutlined onClick={resetSearch} />
                        </Tooltip>
                    )
                }
            />
        </div>
    );
}

export default SearchItems;
