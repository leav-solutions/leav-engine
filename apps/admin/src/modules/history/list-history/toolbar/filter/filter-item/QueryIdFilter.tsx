import {useTranslation} from 'react-i18next';
import {TextFilter} from '../../../../../ui/filter/TextFilter';

type QueryIdFilterProps = {
    loading: boolean;
    value: string | null;
    onChange: (value: string | null) => void;
    onReset: () => void;
};

export const QueryIdFilter = ({loading, value, onChange, onReset}: QueryIdFilterProps) => {
    const {t} = useTranslation();

    return (
        <TextFilter
            label={t('logs.filters.query_id.label')}
            value={value}
            onChange={onChange}
            onReset={onReset}
            disabled={loading}
        />
    );
};
