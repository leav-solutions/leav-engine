import {useMemo} from 'react';
import {AttributeDetailsFragment, GetAttributesByLibQuery, useGetAttributesByLibQuery} from '../../../_gqlTypes';
import {useLang} from '../../../hooks';
import {localizedTranslation} from '@leav/utils';

interface IColumnsById {
    [key: string]: AttributeDetailsFragment;
}

const _mappging = (data: GetAttributesByLibQuery | undefined, availableLangs: string[]) =>
    data?.attributes?.list.reduce((acc, attribute) => {
        acc[attribute.id] = {
            ...attribute,
            label: localizedTranslation(attribute.label, availableLangs)
        };
        return acc;
    }, {}) ?? {};

export const useGetLibraryColumns = (library: string) => {
    const {lang: availableLangs} = useLang();
    const {data} = useGetAttributesByLibQuery({
        variables: {
            library
        }
    });

    const columnsById: IColumnsById = useMemo(() => _mappging(data, availableLangs), [data]);

    return columnsById;
};
