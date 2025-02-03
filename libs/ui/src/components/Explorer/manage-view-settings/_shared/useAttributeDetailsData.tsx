// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ChangeEvent, useMemo, useState} from 'react';
import {useDebouncedValue} from '_ui/hooks/useDebouncedValue';
import {AttributeDetailsFragment, GetAttributesByLibQuery, useGetAttributesByLibQuery} from '_ui/_gqlTypes';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';

interface IColumnsById {
    [attributeId: string]: AttributeDetailsFragment & {index: string};
}

const sanitize = (str: string) =>
    str
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();

const _mapping = (data: GetAttributesByLibQuery | undefined, availableLanguages: string[]): IColumnsById =>
    data?.attributes?.list.reduce((acc, attribute) => {
        const label = localizedTranslation(attribute.label, availableLanguages);
        acc[attribute.id] = {
            ...attribute,
            label,
            index: `${sanitize(attribute.id)} ${sanitize(label)}`
        };
        return acc;
    }, {}) ?? {};

export const useAttributeDetailsData = (libraryId: string) => {
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearchInput = useDebouncedValue(searchInput, 300);

    const {lang: availableLanguages} = useLang();
    const {data} = useGetAttributesByLibQuery({
        variables: {
            library: libraryId
        }
    });
    const attributeDetailsById = _mapping(data, availableLanguages);

    const searchFilteredColumns = useMemo(() => {
        const columnIds = Object.keys(attributeDetailsById);
        if (columnIds.length === 0) {
            return {};
        }
        if (debouncedSearchInput === '') {
            return attributeDetailsById;
        }

        const searchString = sanitize(debouncedSearchInput);

        return columnIds.reduce((acc, columnId) => {
            if (attributeDetailsById[columnId].index.includes(searchString)) {
                acc[columnId] = attributeDetailsById[columnId];
            }
            return acc;
        }, {});
    }, [debouncedSearchInput, attributeDetailsById]);
    const searchFilteredColumnsIds = Object.keys(searchFilteredColumns);

    const onSearchChanged = (event: ChangeEvent<HTMLInputElement>) => {
        const shouldIgnoreInputChange = event.target.value.length < 3 && debouncedSearchInput.length < 3;
        if (shouldIgnoreInputChange) {
            return;
        }
        setSearchInput(() => {
            if (event.target.value.length > 2) {
                return event.target.value;
            }
            return '';
        });
    };

    return {
        attributeDetailsById,
        searchFilteredColumnsIds,
        onSearchChanged
    };
};
