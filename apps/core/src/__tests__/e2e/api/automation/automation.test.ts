// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {adminUserId} from '../../../../_constants/users';
import {
    AutomationRuleEventAction,
    AutomationTriggerDefSynchronicity,
    AutomationTriggerDefTopics,
    AutomationRuleActions,
} from '../../_gqlTypes';
import {adminUserSdk, nonAdminUserSdk} from '../e2eUtils';

describe('Automation', () => {
    describe('get automation rules', () => {
        test('list rules (empty)', async () => {
            const rules = await adminUserSdk.GetAutomationRules();
            expect(rules.automationRules.list).toBeInstanceOf(Array);
        });

        test('non-admin user cannot list rules', async () => {
            await expect(nonAdminUserSdk.GetAutomationRules()).rejects.toThrow('Action forbidden');
        });
    });

    describe('create automation rule', () => {
        test('create a rule', async () => {
            const newRule = (
                await adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        description: 'This is a test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {
                            steps: [
                                {
                                    type: AutomationRuleActions.log,
                                    name: 'my-log',
                                    params: {message: 'hello from pipeline'},
                                },
                                {
                                    type: AutomationRuleActions.condition,
                                    params: {result: true},
                                },
                            ],
                        },
                    },
                })
            ).createAutomationRule;

            expect(newRule).toMatchObject({
                id: expect.any(String),
                label: 'Test rule',
            });

            const rules = await adminUserSdk.GetAutomationRules();
            expect(rules.automationRules.list).toEqual([
                expect.objectContaining({
                    id: newRule.id,
                    label: 'Test rule',
                    description: 'This is a test rule',
                    active: false,
                    createdAt: expect.any(Number),
                    createdBy: adminUserId,
                    modifiedAt: expect.any(Number),
                    modifiedBy: adminUserId,
                    trigger: {
                        synchronous: expect.any(Boolean),
                        eventAction: expect.any(String),
                        eventTopic: {
                            library: expect.any(String),
                        },
                    },
                    pipeline: {
                        steps: [
                            {
                                type: AutomationRuleActions.log,
                                name: 'my-log',
                                params: {message: 'hello from pipeline'},
                            },
                            {
                                type: AutomationRuleActions.condition,
                                name: null,
                                params: {result: true},
                            },
                        ],
                    },
                }),
            ]);
        });

        test('create a rule with invalid pipeline throw an error', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Invalid params rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {
                            steps: [
                                {
                                    type: AutomationRuleActions.log,
                                    params: {}, // missing required 'message'
                                },
                            ],
                        },
                    },
                }),
            ).rejects.toThrow(/Invalid action parameters/);
        });

        test('non-admin user cannot create a rule', async () => {
            await expect(
                nonAdminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {steps: []},
                    },
                }),
            ).rejects.toThrow('Action forbidden');
        });

        test('cannot create a rule with wrong synchronicity', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        trigger: {
                            synchronous: false,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {steps: []},
                    },
                }),
            ).rejects.toThrow('Trigger for event action RECORD_INIT is only available for synchronous execution');
        });

        test('cannot create a rule with wrong event topic, library not exists', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'library-no-exists',
                            },
                        },
                        pipeline: {steps: []},
                    },
                }),
            ).rejects.toThrow('Invalid trigger library topic: Library with id "library-no-exists" does not exist');
        });

        test('cannot create a rule with wrong event topic, missing library topic', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {},
                        },
                        pipeline: {steps: []},
                    },
                }),
            ).rejects.toThrow('Invalid trigger library topic: Invalid input: expected string, received undefined');
        });

        test('cannot create a rule with wrong event topic, unexpected attribute topic', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                                attribute: 'attribute-no-expected',
                            },
                        },
                        pipeline: {steps: []},
                    },
                }),
            ).rejects.toThrow('Invalid trigger attribute topic: Unrecognized key: "attribute"');
        });

        test('cannot create an activated rule with an empty pipeline', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {steps: []},
                        active: true,
                    },
                }),
            ).rejects.toThrow('Cannot activate an automation rule with an empty pipeline');
        });
    });

    describe('update automation rule', () => {
        let ruleToUpdate: any;

        beforeEach(async () => {
            ruleToUpdate = (
                await adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        description: 'This is a test rule',
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {steps: []},
                    },
                })
            ).createAutomationRule;
        });

        test('update a rule', async () => {
            await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated

            const updatedRule = (
                await adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        label: 'updated label',
                        pipeline: {
                            steps: [
                                {
                                    type: AutomationRuleActions.log,
                                    params: {message: 'updated pipeline step'},
                                },
                            ],
                        },
                    },
                })
            ).updateAutomationRule;

            expect(updatedRule).toEqual(
                expect.objectContaining({
                    id: ruleToUpdate.id,
                    label: 'updated label',
                    description: 'This is a test rule', // we verify mergeObjects is true
                    pipeline: {
                        steps: [
                            {
                                type: AutomationRuleActions.log,
                                name: null,
                                params: {message: 'updated pipeline step'},
                            },
                        ],
                    },
                }),
            );

            expect(updatedRule.modifiedAt).toBeGreaterThan(ruleToUpdate.modifiedAt);
        });

        test('update a rule with invalid pipeline throw an error', async () => {
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        pipeline: {
                            steps: [
                                {
                                    type: AutomationRuleActions.log,
                                    params: {}, // missing required 'message'
                                },
                            ],
                        },
                    },
                }),
            ).rejects.toThrow(/Invalid action parameters/);
        });

        test('non admin cannot update a rule', async () => {
            await expect(
                nonAdminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        label: 'Test rule',
                    },
                }),
            ).rejects.toThrow('Action forbidden');
        });

        test('cannot update a rule with wrong synchronicity', async () => {
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        trigger: {
                            synchronous: false,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                    },
                }),
            ).rejects.toThrow('Trigger for event action RECORD_INIT is only available for synchronous execution');
        });

        test('cannot update a rule with wrong event topic, library not exists', async () => {
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'library-no-exists',
                            },
                        },
                    },
                }),
            ).rejects.toThrow('Invalid trigger library topic: Library with id "library-no-exists" does not exist');
        });

        test('cannot activate a rule with an empty pipeline', async () => {
            // it should throw on activate if existing pipeline is empty
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        active: true,
                    },
                }),
            ).rejects.toThrow('Cannot activate an automation rule with an empty pipeline');

            // it should throw if we update pipeline to empty while activating
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        active: true,
                        pipeline: {
                            steps: [],
                        },
                    },
                }),
            ).rejects.toThrow('Cannot activate an automation rule with an empty pipeline');
        });

        test('update unknown rule throws UNKNOWN_AUTOMATION_RULE', async () => {
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: 'nonexistent-rule-id',
                        label: 'ghost',
                    },
                }),
            ).rejects.toThrow(/Unknown automation rule/);
        });
    });

    describe('delete automation rule', () => {
        let ruleToDelete: any;

        beforeEach(async () => {
            ruleToDelete = (
                await adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        description: 'This is a test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {steps: []},
                    },
                })
            ).createAutomationRule;
        });

        test('delete a rule', async () => {
            const deletedRule = (await adminUserSdk.DeleteAutomationRule({ruleId: ruleToDelete.id}))
                .deleteAutomationRule;

            expect(deletedRule).toEqual(
                expect.objectContaining({
                    id: ruleToDelete.id,
                }),
            );
        });

        test('cannot delete a rule', async () => {
            await expect(
                nonAdminUserSdk.DeleteAutomationRule({
                    ruleId: ruleToDelete.id,
                }),
            ).rejects.toThrow('Action forbidden');
        });

        test('delete unknown rule throws UNKNOWN_AUTOMATION_RULE', async () => {
            await expect(
                adminUserSdk.DeleteAutomationRule({
                    ruleId: 'nonexistent-rule-id',
                }),
            ).rejects.toThrow(/Unknown automation rule/);
        });
    });

    describe('list automation triggers', () => {
        test('should contains at least RECORD_INIT trigger', async () => {
            const triggersDef = await adminUserSdk.ListAutomationTriggersDef();
            expect(triggersDef.automationTriggersDef.length).toBeGreaterThanOrEqual(1);

            expect(triggersDef.automationTriggersDef).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        eventAction: AutomationRuleEventAction.RECORD_INIT,
                        topics: [AutomationTriggerDefTopics.LIBRARY],
                        synchronicity: AutomationTriggerDefSynchronicity.SYNC,
                    }),
                ]),
            );
        });

        test('non-admin user cannot list triggers', async () => {
            await expect(nonAdminUserSdk.ListAutomationTriggersDef()).rejects.toThrow('Action forbidden');
        });
    });
});
