import {localizedTranslation} from '@leav/utils';
import useLang from '../../../../../../../hooks/useLang';
import {type FilterOption} from '../../../../../../ui/filter/types';
import {useGetAttributesForFilterLazyQuery} from '../../../../../../../_gqlTypes';

export const useGetAttributesForFilter = () => {
    const {lang} = useLang();
    const [fetchAttributesQuery, {data, loading}] = useGetAttributesForFilterLazyQuery();

    const attributes: FilterOption[] = (data?.attributes?.list ?? []).map(attribute => ({
        value: attribute.id,
        label: localizedTranslation(attribute.label, lang) || attribute.id,
    }));

    // The variable carries the whole input, not just the library list, so we can pass `undefined`
    // rather than send `filters: {libraries: null}` to the backend.
    const fetchAttributes = (libraryId: string | null) => {
        fetchAttributesQuery({variables: {filters: libraryId ? {libraries: [libraryId]} : undefined}});
    };

    return {fetchAttributes, attributes, loading};
};
