import {useTranslation} from 'react-i18next';
import {SingleSelectFilter} from '../../../../../ui/filter/SingleSelectFilter';

type ExecutionModeValue = 'synchronous' | 'asynchronous';

type ExecutionModeFilterProps = {
    loading: boolean;
    value: boolean | null;
    onChange: (value: boolean | null) => void;
    onReset: () => void;
};

export const ExecutionModeFilter = ({loading, value, onChange, onReset}: ExecutionModeFilterProps) => {
    const {t} = useTranslation();

    return (
        <SingleSelectFilter<ExecutionModeValue>
            label={t('automation.filters.execution_mode.label')}
            options={[
                {value: 'synchronous', label: t('automation.filters.execution_mode.synchronous')},
                {value: 'asynchronous', label: t('automation.filters.execution_mode.asynchronous')},
            ]}
            value={value === null ? null : value ? 'synchronous' : 'asynchronous'}
            onChange={next => onChange(next === null ? null : next === 'synchronous')}
            onReset={onReset}
            disabled={loading}
        />
    );
};
