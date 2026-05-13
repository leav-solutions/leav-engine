import {type AutomationRuleEventAction} from '../../../_types/automation';

export enum AutomationTriggerDefTopics {
    LIBRARY = 'LIBRARY',
    ATTRIBUTE = 'ATTRIBUTE',
    // Add a new entry here when a new topic key is added to IDbPayload['topic']
}

export enum AutomationTriggerDefSynchronicity {
    SYNC = 'SYNC',
    ASYNC = 'ASYNC',
    BOTH = 'BOTH',
}

// Public shape returned by getAutomationTriggers() and exposed via GraphQL
export type AutomationTriggerDef = {
    eventAction: AutomationRuleEventAction;
    topics: AutomationTriggerDefTopics[];
    synchronicity: AutomationTriggerDefSynchronicity;
};
