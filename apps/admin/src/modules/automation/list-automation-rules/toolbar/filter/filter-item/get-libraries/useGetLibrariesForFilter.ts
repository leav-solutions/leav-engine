import {localizedTranslation} from '@leav/utils';
import useLang from '../../../../../../../hooks/useLang';
import {type FilterOption} from '../../../../../../ui/filter/types';
import {useGetLibrariesForFilterLazyQuery} from '../../../../../../../_gqlTypes';

export const useGetLibrariesForFilter = () => {
    const {lang} = useLang();
    const [fetchLibraries, {data, loading}] = useGetLibrariesForFilterLazyQuery();

    const libraries: FilterOption[] = (data?.libraries?.list ?? []).map(library => ({
        value: library.id,
        label: localizedTranslation(library.label, lang) || library.id,
    }));

    // Guard against refetching on every dropdown opening (SingleSelectFilter calls onOpen each time).
    const fetchOnce = () => {
        if (!libraries.length && !loading) {
            fetchLibraries();
        }
    };

    return {fetchOnce, libraries, loading};
};
