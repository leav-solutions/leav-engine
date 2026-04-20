// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AutomationRuleEventAction, SyncAutomationRuleEventAction} from '../../_types/automation';
import {type IQueryInfos} from '../../_types/queryInfos';
import {EventAction} from '@leav/utils';

/**
 * This list of topic should match AutomationRulesEventTopic properties
 */
export enum AutomationTriggerDefTopics {
    LIBRARY = 'LIBRARY',
    ATTRIBUTE = 'ATTRIBUTE',
    // and so on for other topic types
}

export enum AutomationTriggerDefSynchronicity {
    SYNC = 'SYNC',
    ASYNC = 'ASYNC',
    BOTH = 'BOTH',
}

export type AutomationTriggerDef = {
    eventAction: AutomationRuleEventAction;
    topics: AutomationTriggerDefTopics[]; // May be object with "mandatory" or "optional" property ?
    synchronicity: AutomationTriggerDefSynchronicity;
};

export interface IAutomationTriggers {
    getAutomationTriggers({ctx}: {ctx: IQueryInfos}): AutomationTriggerDef[];
}

export default function (): IAutomationTriggers {
    const triggers: AutomationTriggerDef[] = [
        {
            eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
            topics: [AutomationTriggerDefTopics.LIBRARY],
            synchronicity: AutomationTriggerDefSynchronicity.SYNC,
        },
        {
            eventAction: EventAction.RECORD_SAVE,
            topics: [AutomationTriggerDefTopics.LIBRARY],
            synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
        },
        {
            eventAction: EventAction.VALUE_SAVE,
            topics: [AutomationTriggerDefTopics.LIBRARY, AutomationTriggerDefTopics.ATTRIBUTE],
            synchronicity: AutomationTriggerDefSynchronicity.BOTH, // Just for testing
        },
    ];

    return {
        getAutomationTriggers: ({ctx}) => triggers,
    };
}
