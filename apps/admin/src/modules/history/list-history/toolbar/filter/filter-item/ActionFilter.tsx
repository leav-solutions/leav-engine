import {useTranslation} from 'react-i18next';
import {LogAction} from '../../../../../../_gqlTypes';
import {MultiSelectFilter} from '../../../../../ui/filter/MultiSelectFilter';

type ActionFilterProps = {
    loading: boolean;
    value: LogAction[];
    onChange: (value: LogAction[]) => void;
    onReset: () => void;
};

export const ActionFilter = ({loading, value, onChange, onReset}: ActionFilterProps) => {
    const {t} = useTranslation();

    const options = Object.values(LogAction).map(action => ({value: action, label: action}));

    return (
        <MultiSelectFilter<LogAction>
            label={t('logs.filters.action.label')}
            options={options}
            value={value}
            onChange={onChange}
            onReset={onReset}
            disabled={loading}
            searchable
        />
    );
};
