import {useState} from 'react';
import {type AutomationRulesFiltersInput, type PartialAutomationRuleTriggerInput} from '../../../../../_gqlTypes';
import {DEFAULT_FILTERS_VALUES} from './constants';
import {type AutomationFiltersValues, type OnAutomationFilterChange} from './types';

type UseAutomationFiltersParams = {
    onFilterChange: () => void;
};

export const useAutomationFilters = ({onFilterChange: onFilterChangeCallback}: UseAutomationFiltersParams) => {
    const [filtersValues, setFiltersValues] = useState<AutomationFiltersValues>({...DEFAULT_FILTERS_VALUES});

    const eventTopic = {
        ...(filtersValues.library ? {library: filtersValues.library} : {}),
        ...(filtersValues.attribute ? {attribute: filtersValues.attribute} : {}),
    };

    const trigger: PartialAutomationRuleTriggerInput = {
        ...(filtersValues.eventAction ? {eventAction: filtersValues.eventAction} : {}),
        ...(filtersValues.synchronous !== null ? {synchronous: filtersValues.synchronous} : {}),
        ...(Object.keys(eventTopic).length ? {eventTopic} : {}),
    };

    const filters: AutomationRulesFiltersInput = {
        ...(filtersValues.active !== null ? {active: filtersValues.active} : {}),
        ...(filtersValues.version ? {version: filtersValues.version} : {}),
        ...(Object.keys(trigger).length ? {trigger} : {}),
    };

    // Send undefined rather than {} when nothing is filtered, to keep the query identical to the
    // unfiltered one.
    const gqlFilters: AutomationRulesFiltersInput | undefined = Object.keys(filters).length ? filters : undefined;

    const onFilterChange: OnAutomationFilterChange = (key, value) => {
        setFiltersValues(prev => ({
            ...prev,
            [key]: value,
            // Changing the library invalidates the selected attribute: an attribute that does not
            // belong to it would always yield zero result.
            ...(key === 'library' ? {attribute: null} : {}),
        }));
        onFilterChangeCallback();
    };

    const onFilterReset = () => {
        setFiltersValues({...DEFAULT_FILTERS_VALUES});
        onFilterChangeCallback();
    };

    return {gqlFilters, filtersValues, onFilterChange, onFilterReset};
};
