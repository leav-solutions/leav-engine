// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {AttributeDetailsFragment, GetAttributesByLibQuery, useGetAttributesByLibQuery} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';

interface IColumnsById {
    [attributeId: string]: AttributeDetailsFragment;
}

const _mapping = (data: GetAttributesByLibQuery | undefined, availableLanguages: string[]): IColumnsById =>
    data?.attributes?.list.reduce<IColumnsById>((acc, attribute) => {
        acc[attribute.id] = {
            ...attribute,
            label: localizedTranslation(attribute.label, availableLanguages)
        };
        return acc;
    }, {}) ?? {};

export const useGetLibraryColumns = (library: string) => {
    const {lang: availableLanguages} = useLang();
    const {data, error, loading} = useGetAttributesByLibQuery({
        variables: {
            library
        }
    });

    const attributeDetailsById = _mapping(data, availableLanguages);

    return {attributeDetailsById, error, loading};
};
