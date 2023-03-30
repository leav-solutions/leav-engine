// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery} from '@apollo/client';
import {Input, InputRef} from 'antd';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {getRecordsFromLibraryQuery} from 'graphQL/queries/records/getRecordsFromLibraryQuery';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryElement,
    IGetRecordsFromLibraryQueryVariables
} from 'graphQL/queries/records/getRecordsFromLibraryQueryTypes';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {SortOrder} from '_gqlTypes/globalTypes';
import {RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linked_library} from '_gqlTypes/RECORD_FORM';

interface IQuickSearchProps {
    library: RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linked_library;
    onResult: (elements: IGetRecordsFromLibraryQueryElement[], totalCount: number) => void;
    onClear: () => void;
    pagination?: {limit: number; offset: number};
}

function QuickSearch({library, onResult, onClear, pagination}: IQuickSearchProps): JSX.Element {
    const {t} = useTranslation();
    const searchInputRef = useRef<InputRef>();
    const [search, setSearch] = useState<string>('');

    const [runSearch, {loading, error}] = useLazyQuery<
        IGetRecordsFromLibraryQuery,
        IGetRecordsFromLibraryQueryVariables
    >(getRecordsFromLibraryQuery(library.gqlNames.query, [], true), {
        onCompleted: searchResult => {
            const {totalCount, list} = searchResult[library.gqlNames.query];
            onResult(list, totalCount);
        }
    });

    const _handleSearchSubmit = (submittedSearch: string) => {
        if (!submittedSearch) {
            setSearch('');
            return onClear();
        }

        setSearch(submittedSearch);
    };

    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!search) {
            return;
        }

        runSearch({
            variables: {
                fullText: search,
                limit: pagination.limit ?? null,
                offset: pagination.offset ?? null
            }
        });
    }, [search, pagination, runSearch]);

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    return (
        <Input.Search
            placeholder={t('record_edition.search_elements')}
            onSearch={_handleSearchSubmit}
            loading={loading}
            allowClear
            ref={searchInputRef}
            aria-label={t('record_edition.search_elements')}
        />
    );
}

export default QuickSearch;
