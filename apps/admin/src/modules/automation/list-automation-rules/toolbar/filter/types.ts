import {type AutomationRuleEventAction} from '../../../../../_gqlTypes';

export type AutomationFiltersValues = {
    library: string | null;
    attribute: string | null;
    eventAction: AutomationRuleEventAction | null;
    active: boolean | null;
    synchronous: boolean | null;
    version: string | null;
};

export type OnAutomationFilterChange = <FilterKey extends keyof AutomationFiltersValues>(
    key: FilterKey,
    value: AutomationFiltersValues[FilterKey],
) => void;
