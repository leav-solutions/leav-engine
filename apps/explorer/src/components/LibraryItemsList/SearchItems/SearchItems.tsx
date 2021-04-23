// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Input, Tooltip} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setFiltersSearchFullTextActive} from 'redux/filters';
import {setItems, setItemsLoading, setItemsOffset, setItemsTotalCount} from 'redux/items';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled, {CSSObject} from 'styled-components';
import {getLibrariesListQuery} from '../../../graphQL/queries/libraries/getLibrariesListQuery';
import {
    ISearchFullTextQuery,
    ISearchFullTextResult,
    ISearchFullTextVar,
    searchFullText
} from '../../../graphQL/queries/searchFullText/searchFullText';
import {useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {manageItems} from '../manageItems';

interface IDeleteSearchCross {
    style?: CSSObject;
    search: string;
}

const DeleteSearchCross = styled.div<IDeleteSearchCross>`
    opacity: ${props => (props.search ? 1 : 0)};
`;

function SearchItems(): JSX.Element {
    const {items, fields: fieldsState, filters} = useAppSelector(state => state);
    const dispatch = useAppDispatch();
    const {t} = useTranslation();

    const [search, setSearch] = useState<string>('');
    const [updateSearch, setUpdateSearch] = useState(false);

    const [{lang}] = useLang();

    const [activeLib] = useActiveLibrary();

    const [triggerSearch, {data, called, loading, error}] = useLazyQuery<ISearchFullTextQuery, ISearchFullTextVar>(
        activeLib?.id
            ? searchFullText(activeLib?.id, activeLib?.gql?.type || '', fieldsState.fields)
            : getLibrariesListQuery,
        {
            variables: {
                search,
                from: items.offset,
                size: items.pagination
            }
        }
    );

    // when current lib change disabled search
    useEffect(() => {
        setSearch('');

        dispatch(setFiltersSearchFullTextActive(false));
        dispatch(setItemsOffset(0));
    }, [activeLib, dispatch, setSearch]);

    // reload query when columns, pagination or offset change
    useEffect(() => {
        if (filters.searchFullTextActive) {
            setUpdateSearch(true);
            triggerSearch();
        }
    }, [
        setUpdateSearch,
        triggerSearch,
        fieldsState.fields,
        filters.searchFullTextActive,
        items.pagination,
        items.offset
    ]);

    useEffect(() => {
        if (called && !loading && data && updateSearch && activeLib) {
            const totalCount = data[activeLib.id]?.totalCount;
            const itemsFromQuery: ISearchFullTextResult[] = data[activeLib.id].list;

            const newItems = manageItems({items: itemsFromQuery, lang, fields: fieldsState.fields});

            dispatch(setItemsTotalCount(totalCount));
            dispatch(setItems(newItems));

            setUpdateSearch(false);

            dispatch(setItemsLoading(false));
        }
    }, [called, loading, data, updateSearch, setUpdateSearch, dispatch, lang, fieldsState.fields, activeLib]);

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
            dispatch(setFiltersSearchFullTextActive(true));
            dispatch(setItemsOffset(0));
            dispatch(setItemsLoading(true));

            setSearch(newSearch);
            setUpdateSearch(true);

            triggerSearch();
        }
    };

    const resetSearch = () => {
        setSearch('');

        dispatch(setFiltersSearchFullTextActive(false));
        dispatch(setItemsOffset(0));
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
