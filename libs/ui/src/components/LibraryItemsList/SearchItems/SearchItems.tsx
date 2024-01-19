// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import React from 'react';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {SearchActionTypes} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

function SearchItems(): JSX.Element {
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const {t} = useSharedTranslation();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        searchDispatch({type: SearchActionTypes.SET_FULLTEXT, fullText: event.target.value});
    };

    const handleEnter = e => {
        searchDispatch({type: SearchActionTypes.APPLY_FILTERS});
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
