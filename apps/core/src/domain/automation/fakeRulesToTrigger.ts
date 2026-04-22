// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type AutomationRuleEventAction,
    type AutomationRulesEventTopic,
    type IAutomationRule,
    AutomationRuleActions,
} from '../../_types/automation';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type ConditionActionParams} from './actions/conditionAction';
import {type ErrorActionParams} from './actions/errorAction';
import {type LogActionParams} from './actions/logAction';

// Temporary shortcut to avoid creating, updating and retrieving real rules from the database while the system is being developed and tested.

export const TRIGGER_FAKER_RULES_FOR_DEV = false;

export const buildFakeRulesToTrigger = async (
    event: {action: AutomationRuleEventAction; topic?: AutomationRulesEventTopic},
    synchronous: boolean,
    ctx: IQueryInfos,
): Promise<IAutomationRule[]> => {
    const fakeRuleIdLog: IAutomationRule = {
        id: 'fake_rule_id_log',
        label: 'Fake rule with log action',
        active: true,
        trigger: {
            synchronous,
            eventAction: event.action,
            eventTopic: event.topic,
        },
        pipeline: {
            steps: [
                {
                    type: AutomationRuleActions.CONDITION,
                    params: {
                        result: true,
                    } satisfies ConditionActionParams,
                },
                {
                    type: AutomationRuleActions.LOG,
                    params: {
                        message: 'Un message',
                        level: 'verbose',
                    } satisfies LogActionParams,
                },
                {
                    type: AutomationRuleActions.LOG,
                    params: {
                        message: `Triggered by event action ${event.action} and topic ${JSON.stringify(event.topic)}`,
                        level: 'verbose',
                    } satisfies LogActionParams,
                },
            ],
        },
        createdAt: Date.now(),
        createdBy: 'system',
        modifiedAt: Date.now(),
        modifiedBy: 'system',
    };
    const fakeRuleIdConditionError: IAutomationRule = {
        id: 'fake_rule_id_condition_error',
        label: 'Fake rule with condition and error actions',
        active: true,
        trigger: {
            synchronous,
            eventAction: event.action,
            eventTopic: event.topic,
        },
        pipeline: {
            steps: [
                {
                    type: AutomationRuleActions.CONDITION,
                    params: {
                        result: true,
                    } satisfies ConditionActionParams,
                },
                // {
                //     type: AutomationRuleActions.LOG,
                //     params: {
                //         result: true, // wrong param to trigger validation error
                //     } satisfies ConditionActionParams,
                // },
                {
                    type: AutomationRuleActions.ERROR,
                    params: {
                        message: 'This is an error action in the pipeline',
                    } satisfies ErrorActionParams,
                },
            ],
        },
        createdAt: Date.now(),
        createdBy: 'system',
        modifiedAt: Date.now(),
        modifiedBy: 'system',
    };
    return [
        fakeRuleIdLog,
        // comment next rule to avoid error logs
        // fakeRuleIdConditionError,
    ];
};
