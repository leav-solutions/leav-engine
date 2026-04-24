// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
