// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery} from '@apollo/client';
import {Input,InputRef} from 'antd';
import {useEffect,useRef,useState} from 'react';
import {ErrorDisplay} from '_ui/components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {
    getRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryElement,
    IGetRecordsFromLibraryQueryVariables
} from '_ui/_queries/records/getRecordsFromLibraryQuery';

interface IQuickSearchProps {
    library: RecordFormAttributeLinkAttributeFragment['linked_library'];
    onResult: (elements: IGetRecordsFromLibraryQueryElement[], totalCount: number) => void;
    onClear: () => void;
    pagination?: {limit: number; offset: number};
}

function QuickSearch({library, onResult, onClear, pagination}: IQuickSearchProps): JSX.Element {
    const {t} = useSharedTranslation();
    const searchInputRef = useRef<InputRef>();
    const [search, setSearch] = useState<string>('');

    const [runSearch, {loading, error}] = useLazyQuery<
        IGetRecordsFromLibraryQuery,
        IGetRecordsFromLibraryQueryVariables
    >(getRecordsFromLibraryQuery([], true), {
        onCompleted: searchResult => {
            const {totalCount, list} = searchResult.records;
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
                library: library.id,
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
