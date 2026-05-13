// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type AutomationRuleEventAction,
    type AutomationRuleEventTopic,
    type IAutomationRule,
} from '../../_types/automation';
import {type IQueryInfos} from '../../_types/queryInfos';
import {AutomationRuleActions} from './actions/_types';
import {type ConditionActionParams} from './actions/conditionAction';
import {type ErrorActionParams} from './actions/errorAction';
import {type JexlCalculationActionParams} from './actions/jexlCalculationAutomationAction';
import {type LogActionParams} from './actions/logAction';
import {type ModifyAttributeActionParams} from './actions/modifyAttributeAction';

// Temporary shortcut to avoid creating, updating and retrieving real rules from the database while the system is being developed and tested.

export const TRIGGER_FAKER_RULES_FOR_DEV = false;

export const buildFakeRulesToTrigger = async (
    event: {action: AutomationRuleEventAction; topic?: AutomationRuleEventTopic},
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
                        expression: 'true',
                    } satisfies ConditionActionParams,
                },
                {
                    type: AutomationRuleActions.JEXL_CALCULATION,
                    name: 'hello-world',
                    params: {
                        formula: '"Hello " + "world! (" + results[0] + ")"',
                    } satisfies JexlCalculationActionParams,
                },
                {
                    type: AutomationRuleActions.JEXL_CALCULATION,
                    name: 'use previous results',
                    params: {
                        formula: '(results[1] | uppercase) + " | " + (results["hello-world"] | length)',
                    } satisfies JexlCalculationActionParams,
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
    const fakeRuleIdInitCampaign: IAutomationRule = {
        id: 'fake_rule_id_init_campaign',
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
                    type: AutomationRuleActions.JEXL_CALCULATION,
                    name: 'use previous results',
                    params: {
                        formula: '"Jexl campaigns label " + now()',
                    } satisfies JexlCalculationActionParams,
                },
                {
                    type: AutomationRuleActions.MODIFY_ATTRIBUTE,
                    params: {
                        attributePath: 'campaigns_label', // test_jexl_label
                        mode: 'add',
                    } satisfies ModifyAttributeActionParams,
                },
                {
                    type: AutomationRuleActions.JEXL_CALCULATION,
                    params: {
                        formula:
                            "{ from: dateTimeToMillis(dateTimeAdd(now(), 'day', 0-3)) // 1000, to: dateTimeToMillis(dateTimeAdd(now(), 'day', 5)) // 1000 } | string",
                    } satisfies JexlCalculationActionParams,
                },
                {
                    type: AutomationRuleActions.MODIFY_ATTRIBUTE,
                    params: {
                        attributePath: 'campaigns_dates', // test_jexl_periode
                        mode: 'add',
                    } satisfies ModifyAttributeActionParams,
                },
                {
                    type: AutomationRuleActions.JEXL_CALCULATION,
                    params: {
                        formula: "{ id: '10028330' }",
                    } satisfies JexlCalculationActionParams,
                },
                {
                    type: AutomationRuleActions.MODIFY_ATTRIBUTE,
                    params: {
                        attributePath: 'campaigns_type',
                        mode: 'replace',
                    } satisfies ModifyAttributeActionParams,
                },
                {
                    type: AutomationRuleActions.JEXL_CALCULATION,
                    params: {
                        formula: "{ id: '10027357' }",
                    } satisfies JexlCalculationActionParams,
                },
                {
                    type: AutomationRuleActions.MODIFY_ATTRIBUTE,
                    params: {
                        attributePath: 'campaigns_category',
                        mode: 'replace',
                    } satisfies ModifyAttributeActionParams,
                },
                // disable to avoid create error logs in structure_items init records, to if we ignore those errors, there are well created
                // {
                //     type: AutomationRuleActions.JEXL_CALCULATION,
                //     params: {
                //         formula:
                //             "[{ id: '51697252', library: 'structure_items' }, { id: '51697258', library: 'structure_items' }]",
                //     } satisfies JexlCalculationActionParams,
                // },
                // {
                //     type: AutomationRuleActions.MODIFY_ATTRIBUTE,
                //     params: {
                //         attributePath: 'campaigns_structure_items',
                //         mode: 'add',
                //     } satisfies ModifyAttributeActionParams,
                // },
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
                        expression: 'true',
                    } satisfies ConditionActionParams,
                },
                // {
                //     type: 'not exists' as AutomationRuleActions.LOG,
                //     params: {},
                // },
                // {
                //     type: AutomationRuleActions.JEXL_CALCULATION,
                //     name: 'wrong expression',
                //     params: {
                //         formula: '"Hello " +',
                //     } satisfies JexlCalculationActionParams,
                // },
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
        // fakeRuleIdInitCampaign,
        // comment next rule to avoid error logs
        // fakeRuleIdConditionError,
    ];
};
