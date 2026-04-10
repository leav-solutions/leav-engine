// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {type ISystemTranslation} from './systemTranslation';
import {type EventAction, type IDbPayload} from '@leav/utils';

export type IAutomationRule = ICoreEntity & {
    // metadata
    createdAt: number;
    createdBy: string;
    modifiedAt: number;
    modifiedBy: string;

    id: string;
    label: ISystemTranslation;
    description?: ISystemTranslation;
    active: boolean;
    trigger: AutomationRuleTrigger;
};

export type ICreateAutomationRule = {
    label: ISystemTranslation;
    description?: ISystemTranslation;
    trigger: AutomationRuleTrigger;
};

export type IUpdateAutomationRule = {
    id: string;
    label?: ISystemTranslation;
    description?: ISystemTranslation;
    active?: boolean;
    trigger?: Partial<AutomationRuleTrigger>;
};

export type AutomationRuleTrigger = {
    synchronous: boolean;
    eventAction: EventAction | SyncAutomationRuleEventAction;
    eventTopic?: IDbPayload['topic']; // if no specified, the action only is enough to trigger the rule
};

export enum SyncAutomationRuleEventAction {
    RECORD_INIT = 'RECORD_INIT',
}
