import {type EventAction, type IDbPayload} from '@leav/utils';
import {type AutomationRulePipeline} from '../domain/automation/pipeline/_types';

export type IAutomationRule = ICoreEntity & {
    // metadata
    createdAt: number;
    createdBy: string;
    modifiedAt: number;
    modifiedBy: string;

    id: string;
    label: string;
    description?: string;
    version?: string;
    active: boolean;
    trigger: AutomationRuleTrigger;
    pipeline: AutomationRulePipeline;
};

export type ICreateAutomationRule = {
    label: string;
    description?: string;
    version?: string;
    trigger: AutomationRuleTrigger;
    pipeline: AutomationRulePipeline;
    active: boolean;
};

export type IUpdateAutomationRule = {
    id: string;
    label?: string;
    description?: string;
    version?: string;
    active?: boolean;
    trigger?: AutomationRuleTrigger;
    pipeline?: AutomationRulePipeline;
};

export enum AutomationRuleJsonSchemaFormType {
    CREATION = 'creation',
    EDITION = 'edition',
}

// For any event that are not async too, maybe none. Should we remove that ?
export enum SyncAutomationRuleEventAction {}

export type AutomationRuleEventAction = EventAction | SyncAutomationRuleEventAction;
export type AutomationRuleEventTopic = IDbPayload['topic'];

export type AutomationRuleTrigger = {
    synchronous: boolean;
    eventAction: AutomationRuleEventAction;
    eventTopic?: AutomationRuleEventTopic; // if no specified, the action only is enough to trigger the rule
};

export type AutomationRuleIndexEntry = Pick<IAutomationRule, 'id' | 'trigger'>;
