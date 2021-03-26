// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Input, Tooltip} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled, {CSSObject} from 'styled-components';
import {useStateItem} from '../../../Context/StateItemsContext';
import {getLibrariesListQuery} from '../../../graphQL/queries/libraries/getLibrariesListQuery';
import {
    ISearchFullTextQuery,
    ISearchFullTextResult,
    ISearchFullTextVar,
    searchFullText
} from '../../../graphQL/queries/searchFullText/searchFullText';
import {useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';
import {manageItems} from '../manageItems';

interface IDeleteSearchCross {
    style?: CSSObject;
    search: string;
}

const DeleteSearchCross = styled.div<IDeleteSearchCross>`
    opacity: ${props => (props.search ? 1 : 0)};
`;

function SearchItems(): JSX.Element {
    const {stateItems, dispatchItems} = useStateItem();

    const {t} = useTranslation();

    const [search, setSearch] = useState<string>('');
    const [updateSearch, setUpdateSearch] = useState(false);

    const [{lang}] = useLang();

    const [activeLib] = useActiveLibrary();

    const [triggerSearch, {data, called, loading, error}] = useLazyQuery<ISearchFullTextQuery, ISearchFullTextVar>(
        activeLib?.id
            ? searchFullText(activeLib?.id, activeLib?.gql?.type || '', stateItems.fields)
            : getLibrariesListQuery,
        {
            variables: {
                search,
                from: stateItems.offset,
                size: stateItems.pagination
            }
        }
    );

    // when current lib change disabled search
    useEffect(() => {
        setSearch('');

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SEARCH_FULL_TEXT_ACTIVE,
            searchFullTextActive: false
        });

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_OFFSET,
            offset: 0
        });
    }, [activeLib, dispatchItems, setSearch]);

    // reload query when columns, pagination or offset change
    useEffect(() => {
        if (stateItems.searchFullTextActive) {
            setUpdateSearch(true);
            triggerSearch();
        }
    }, [
        setUpdateSearch,
        triggerSearch,
        stateItems.fields,
        stateItems.searchFullTextActive,
        stateItems.pagination,
        stateItems.offset
    ]);

    useEffect(() => {
        if (called && !loading && data && updateSearch && activeLib) {
            const totalCount = data[activeLib.id]?.totalCount;
            const itemsFromQuery: ISearchFullTextResult[] = data[activeLib.id].list;

            const items = manageItems({items: itemsFromQuery, lang, fields: stateItems.fields});

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT,
                totalCount,
                items
            });

            setUpdateSearch(false);

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_ITEM_LOADING,
                itemLoading: false
            });
        }
    }, [called, loading, data, updateSearch, setUpdateSearch, dispatchItems, lang, stateItems.fields, activeLib]);

    if (error) {
        console.error(error);
        return <>error</>;
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearch = event.target.value;

        setSearch(newSearch);
    };

    const handleSearch = (newSearch: string) => {
        if (newSearch === '') {
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

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_ITEM_LOADING,
                itemLoading: true
            });

            setSearch(newSearch);
            setUpdateSearch(true);

            triggerSearch();
        }
    };

    const resetSearch = () => {
        setSearch('');

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SEARCH_FULL_TEXT_ACTIVE,
            searchFullTextActive: false
        });

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_OFFSET,
            offset: 0
        });
    };

    return (
        <div>
            <Input.Search
                placeholder={t('search.placeholder')}
                value={search}
                onChange={handleChange}
                onSearch={handleSearch}
                suffix={
                    <DeleteSearchCross search={search}>
                        <Tooltip placement="bottom" title={t('search.explain-cancel')}>
                            <CloseOutlined onClick={resetSearch} />
                        </Tooltip>
                    </DeleteSearchCross>
                }
            />
        </div>
    );
}

export default SearchItems;
