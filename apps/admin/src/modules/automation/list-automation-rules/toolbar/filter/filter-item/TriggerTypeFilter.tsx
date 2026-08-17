import {useTranslation} from 'react-i18next';
import {AutomationRuleEventAction} from '../../../../../../_gqlTypes';
import {SingleSelectFilter} from '../../../../../ui/filter/SingleSelectFilter';

type TriggerTypeFilterProps = {
    loading: boolean;
    value: AutomationRuleEventAction | null;
    onChange: (value: AutomationRuleEventAction | null) => void;
    onReset: () => void;
};

export const TriggerTypeFilter = ({loading, value, onChange, onReset}: TriggerTypeFilterProps) => {
    const {t} = useTranslation();

    const options = Object.values(AutomationRuleEventAction).map(eventAction => ({
        value: eventAction,
        label: eventAction,
    }));

    return (
        <SingleSelectFilter<AutomationRuleEventAction>
            label={t('automation.filters.trigger.label')}
            options={options}
            value={value}
            onChange={onChange}
            onReset={onReset}
            disabled={loading}
        />
    );
};
