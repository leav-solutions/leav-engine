import {useTranslation} from 'react-i18next';
import {SingleSelectFilter} from '../../../../../ui/filter/SingleSelectFilter';

type StatusValue = 'active' | 'inactive';

type StatusFilterProps = {
    loading: boolean;
    value: boolean | null;
    onChange: (value: boolean | null) => void;
    onReset: () => void;
};

export const StatusFilter = ({loading, value, onChange, onReset}: StatusFilterProps) => {
    const {t} = useTranslation();

    return (
        <SingleSelectFilter<StatusValue>
            label={t('automation.filters.status.label')}
            options={[
                {value: 'active', label: t('admin.active')},
                {value: 'inactive', label: t('admin.inactive')},
            ]}
            value={value === null ? null : value ? 'active' : 'inactive'}
            onChange={next => onChange(next === null ? null : next === 'active')}
            onReset={onReset}
            disabled={loading}
        />
    );
};
