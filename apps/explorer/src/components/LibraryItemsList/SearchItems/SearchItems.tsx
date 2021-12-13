// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {getRequestFromFilters} from '../FiltersPanel/getRequestFromFilter';

function SearchItems(): JSX.Element {
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const {t} = useTranslation();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        searchDispatch({type: SearchActionTypes.SET_FULLTEXT, fullText: event.target.value});
    };

    const handleEnter = e => {
        searchDispatch({
            type: SearchActionTypes.SET_QUERY_FILTERS,
            queryFilters: getRequestFromFilters(searchState.filters)
        });

        searchDispatch({type: SearchActionTypes.SET_LOADING, loading: true});
    };

    return (
        <Input.Search
            style={{maxWidth: 500, minWidth: 250}}
            placeholder={t('search.placeholder')}
            value={searchState.fullText}
            onChange={handleChange}
            onPressEnter={handleEnter}
            onSearch={handleEnter}
            loading={searchState.loading}
            allowClear
        />
    );
}

export default SearchItems;
