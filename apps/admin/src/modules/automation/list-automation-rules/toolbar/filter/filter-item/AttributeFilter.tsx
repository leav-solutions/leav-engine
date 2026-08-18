import {useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {SingleSelectFilter} from '../../../../../ui/filter/SingleSelectFilter';
import {useGetAttributesForFilter} from './get-attributes/useGetAttributesForFilter';

type AttributeFilterProps = {
    loading: boolean;
    library: string | null;
    value: string | null;
    onChange: (value: string | null) => void;
    onReset: () => void;
};

export const AttributeFilter = ({loading, library, value, onChange, onReset}: AttributeFilterProps) => {
    const {t} = useTranslation();
    const {fetchAttributes, attributes, loading: attributesLoading} = useGetAttributesForFilter();
    // Attributes must be re-fetched whenever the selected library changes, so the guard tracks the
    // library the last fetch was made for, not a simple "already loaded" boolean.
    const lastFetchedLibraryRef = useRef<string | null | undefined>(undefined);

    const _handleOpen = () => {
        if (lastFetchedLibraryRef.current !== library) {
            lastFetchedLibraryRef.current = library;
            fetchAttributes(library);
        }
    };

    return (
        <SingleSelectFilter
            label={t('automation.filters.attribute.label')}
            options={attributes}
            value={value}
            onChange={onChange}
            onReset={onReset}
            disabled={loading}
            searchable
            loading={attributesLoading}
            onOpen={_handleOpen}
        />
    );
};
