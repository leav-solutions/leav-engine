// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeDetailsFragment, GetAttributesByLibQuery, useGetAttributesByLibQuery} from '../../../_gqlTypes';
import {useLang} from '../../../hooks';
import {localizedTranslation} from '@leav/utils';

interface IColumnsById {
    [attributeId: string]: AttributeDetailsFragment;
}

const _mapping = (data: GetAttributesByLibQuery | undefined, availableLangs: string[]): IColumnsById =>
    data?.attributes?.list.reduce((acc, attribute) => {
        acc[attribute.id] = {
            ...attribute,
            label: localizedTranslation(attribute.label, availableLangs)
        };
        return acc;
    }, {}) ?? {};

export const useGetLibraryColumns = (library: string) => {
    const {lang: availableLangs} = useLang();
    const {data, error, loading} = useGetAttributesByLibQuery({
        variables: {
            library
        }
    });

    const attributeDetailsById = _mapping(data, availableLangs);

    return {attributeDetailsById, error, loading};
};
