// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Input, Tooltip} from 'antd';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setFiltersSearchFullTextActive} from 'redux/filters';
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
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const {filters} = useAppSelector(state => state);

    const dispatch = useAppDispatch();
    const {t} = useTranslation();

    const [fulltextSearch, setFulltextSearch] = useState<string>('');
    const [updateSearch, setUpdateSearch] = useState(false);

    const [{lang}] = useLang();

    const [activeLib] = useActiveLibrary();

    const [triggerSearch, {data, called, loading, error}] = useLazyQuery<ISearchFullTextQuery, ISearchFullTextVar>(
        activeLib?.id
            ? searchFullText(activeLib?.id, activeLib?.gql?.type || '', searchState.fields)
            : getLibrariesListQuery,
        {
            variables: {
                search: fulltextSearch,
                from: searchState.offset,
                size: searchState.pagination
            }
        }
    );

    // when current lib change disabled search
    useEffect(() => {
        setFulltextSearch('');

        dispatch(setFiltersSearchFullTextActive(false));
        searchDispatch({type: SearchActionTypes.SET_OFFSET, offset: 0});
    }, [activeLib, dispatch, setFulltextSearch, searchDispatch]);

    // reload query when columns, pagination or offset change
    useEffect(() => {
        if (filters.searchFullTextActive) {
            setUpdateSearch(true);
            triggerSearch();
        }
    }, [
        setUpdateSearch,
        triggerSearch,
        searchState.fields,
        filters.searchFullTextActive,
        searchState.pagination,
        searchState.offset
    ]);

    useEffect(() => {
        if (called && !loading && data && updateSearch && activeLib) {
            const totalCount = data[activeLib.id]?.totalCount;
            const itemsFromQuery: ISearchFullTextResult[] = data[activeLib.id].list;

            const newRecords = manageItems({items: itemsFromQuery, fields: searchState.fields});

            searchDispatch({type: SearchActionTypes.SET_TOTAL_COUNT, totalCount});
            searchDispatch({type: SearchActionTypes.SET_RECORDS, records: newRecords});
            searchDispatch({type: SearchActionTypes.SET_LOADING, loading: false});

            setUpdateSearch(false);
        }
    }, [
        called,
        loading,
        data,
        updateSearch,
        setUpdateSearch,
        dispatch,
        lang,
        searchState.fields,
        activeLib,
        searchDispatch
    ]);

    if (error) {
        console.error(error);
        return <>error</>;
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearch = event.target.value;

        setFulltextSearch(newSearch);
    };

    const handleSearch = (newSearch: string) => {
        if (newSearch === '') {
            resetSearch();
        } else {
            dispatch(setFiltersSearchFullTextActive(true));

            searchDispatch({type: SearchActionTypes.SET_OFFSET, offset: 0});
            searchDispatch({type: SearchActionTypes.SET_LOADING, loading: true});

            setFulltextSearch(newSearch);
            setUpdateSearch(true);

            triggerSearch();
        }
    };

    const resetSearch = () => {
        setFulltextSearch('');

        dispatch(setFiltersSearchFullTextActive(false));
        searchDispatch({type: SearchActionTypes.SET_OFFSET, offset: 0});
    };

    return (
        <div>
            <Input.Search
                placeholder={t('search.placeholder')}
                value={fulltextSearch}
                onChange={handleChange}
                onSearch={handleSearch}
                suffix={
                    <DeleteSearchCross search={fulltextSearch}>
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
