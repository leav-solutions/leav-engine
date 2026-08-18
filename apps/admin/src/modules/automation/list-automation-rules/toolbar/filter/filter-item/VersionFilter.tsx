import {useTranslation} from 'react-i18next';
import {TextFilter} from '../../../../../ui/filter/TextFilter';

type VersionFilterProps = {
    loading: boolean;
    value: string | null;
    onChange: (value: string | null) => void;
    onReset: () => void;
};

export const VersionFilter = ({loading, value, onChange, onReset}: VersionFilterProps) => {
    const {t} = useTranslation();

    return (
        <TextFilter
            label={t('automation.filters.version.label')}
            value={value}
            onChange={onChange}
            onReset={onReset}
            disabled={loading}
        />
    );
};
