import {CloseOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Input, Tooltip} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled, {CSSObject} from 'styled-components';
import {useStateItem} from '../../../Context/StateItemsContext';
import {useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {getLibrariesListQuery} from '../../../queries/libraries/getLibrariesListQuery';
import {ISearchFullTextQuery, ISearchFullTextVar, searchFullText} from '../../../queries/searchFullText/searchFullText';
import {IItem} from '../../../_types/types';
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
            ? searchFullText(activeLib?.id, activeLib?.gql?.type || '', stateItems.columns)
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
        stateItems.columns,
        stateItems.searchFullTextActive,
        stateItems.pagination,
        stateItems.offset
    ]);

    useEffect(() => {
        if (called && !loading && data && updateSearch && activeLib) {
            const totalCount = data[activeLib.id]?.totalCount;
            const itemsFromQuery = data[activeLib.id].list;

            const items = manageItems({items: itemsFromQuery, lang, columns: stateItems.columns});

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT,
                totalCount,
                items: (items as unknown) as IItem[]
            });

            setUpdateSearch(false);

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_ITEM_LOADING,
                itemLoading: false
            });
        }
    }, [called, loading, data, updateSearch, setUpdateSearch, dispatchItems, lang, stateItems.columns, activeLib]);

    if (error) {
        console.error(error);
        return <>error</>;
    }

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

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_ITEM_LOADING,
                itemLoading: true
            });

            setSearch(search);
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
        <div style={{width: '20rem', display: 'flex'}}>
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
