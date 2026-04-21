// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {adminUserId} from '../../../../_constants/users';
import {SyncAutomationRuleEventAction} from '../../../../_types/automation';
import {AutomationRuleEventAction} from '../../_gqlTypes';
import {adminUserSdk, gqlCreateRecord, nonAdminUserSdk} from '../e2eUtils';

describe('Automation', () => {
    describe('get automation rules', () => {
        test('list rules (empty)', async () => {
            const rules = await adminUserSdk.GetAutomationRules();
            expect(rules.automationRules.list).toBeInstanceOf(Array);
        });

        test('cannot list rules', async () => {
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
                        trigger: {
                            synchronous: false,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'test',
                            },
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
                }),
            ]);
        });

        test('cannot create a rule', async () => {
            await expect(
                nonAdminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        trigger: {
                            synchronous: false,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                        },
                    },
                }),
            ).rejects.toThrow('Action forbidden');
        });
    });

    describe('update automation rule', () => {
        let ruleToUpdate: any;

        beforeAll(async () => {
            ruleToUpdate = (
                await adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        description: 'This is a test rule',
                        trigger: {
                            synchronous: false,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                        },
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
                    },
                })
            ).updateAutomationRule;

            expect(updatedRule).toEqual(
                expect.objectContaining({
                    id: ruleToUpdate.id,
                    label: 'updated label',
                    description: 'This is a test rule', // we verify mergeObjects is true
                }),
            );

            expect(updatedRule.modifiedAt).toBeGreaterThan(ruleToUpdate.modifiedAt);
        });

        test('cannot update a rule', async () => {
            await expect(
                nonAdminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        label: 'Test rule',
                    },
                }),
            ).rejects.toThrow('Action forbidden');
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

    describe('record creation triggers automation rules', () => {
        const testLibraryId = 'automation_trigger_test_lib';

        beforeAll(async () => {
            await adminUserSdk.SaveLibrary({
                library: {
                    id: testLibraryId,
                    label: {en: 'Automation Trigger Test Library'},
                },
            });

            // Create and activate a RECORD_INIT rule for this library
            const rule = (
                await adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'RECORD_INIT smoke test rule',
                        trigger: {
                            synchronous: true,
                            eventAction:
                                SyncAutomationRuleEventAction.RECORD_INIT as unknown as AutomationRuleEventAction,
                            eventTopic: {library: testLibraryId},
                        },
                    },
                })
            ).createAutomationRule;

            await adminUserSdk.UpdateAutomationRule({
                rule: {id: rule.id, active: true},
            });
        });

        test('RECORD_INIT rule does not block record creation', async () => {
            const recordId = await gqlCreateRecord(testLibraryId);
            expect(recordId).toBeTruthy();
            expect(typeof recordId).toBe('string');
        });
    });
});
