// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type EventAction, type IDbPayload} from '@leav/utils';
import {type AutomationRuleActions} from '../domain/automation/actions/_types';

export type IAutomationRule = ICoreEntity & {
    // metadata
    createdAt: number;
    createdBy: string;
    modifiedAt: number;
    modifiedBy: string;

    id: string;
    label: string;
    description?: string;
    active: boolean;
    trigger: AutomationRuleTrigger;
    pipeline: AutomationRulePipeline;
};

export type ICreateAutomationRule = {
    label: string;
    description?: string;
    trigger: AutomationRuleTrigger;
};

export type IUpdateAutomationRule = {
    id: string;
    label?: string;
    description?: string;
    active?: boolean;
    trigger?: AutomationRuleTrigger;
};

export enum SyncAutomationRuleEventAction {
    RECORD_INIT = 'RECORD_INIT',
}

export type AutomationRuleEventAction = EventAction | SyncAutomationRuleEventAction;
export type AutomationRulesEventTopic = IDbPayload['topic'];

export type AutomationRuleTrigger = {
    synchronous: boolean;
    eventAction: AutomationRuleEventAction;
    eventTopic?: AutomationRulesEventTopic; // if no specified, the action only is enough to trigger the rule
};

export type AutomationRulePipeline = {
    steps: AutomationRulePipelineStep[];
};

export type AutomationRulePipelineStep = {
    type: AutomationRuleActions | string; // string for custom/plugin actions
    name?: string;
    params: Record<string, unknown>;
};
