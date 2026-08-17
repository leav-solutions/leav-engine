import {useTranslation} from 'react-i18next';
import {SingleSelectFilter} from '../../../../../ui/filter/SingleSelectFilter';
import {useGetLibrariesForFilter} from './get-libraries/useGetLibrariesForFilter';

type LibraryFilterProps = {
    loading: boolean;
    value: string | null;
    onChange: (value: string | null) => void;
    onReset: () => void;
};

export const LibraryFilter = ({loading, value, onChange, onReset}: LibraryFilterProps) => {
    const {t} = useTranslation();
    const {fetchOnce, libraries, loading: librariesLoading} = useGetLibrariesForFilter();

    return (
        <SingleSelectFilter
            label={t('automation.filters.library.label')}
            options={libraries}
            value={value}
            onChange={onChange}
            onReset={onReset}
            disabled={loading}
            searchable
            loading={librariesLoading}
            onOpen={fetchOnce}
        />
    );
};
