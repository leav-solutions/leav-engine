// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {adminUserId} from '../../../../_constants/users';
import {adminUserSdk, nonAdminUserSdk} from '../e2eUtils';

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
                        label: {
                            en: 'Test rule',
                        },
                        description: {
                            en: 'This is a test rule',
                        },
                    },
                })
            ).createAutomationRule;

            expect(newRule).toMatchObject({
                id: expect.any(String),
                label: {
                    en: 'Test rule',
                },
            });

            const rules = await adminUserSdk.GetAutomationRules();
            expect(rules.automationRules.list).toEqual([
                expect.objectContaining({
                    id: newRule.id,
                    label: {
                        en: 'Test rule',
                    },
                    description: {
                        en: 'This is a test rule',
                    },
                    active: false,
                    createdAt: expect.any(Number),
                    createdBy: adminUserId,
                    modifiedAt: expect.any(Number),
                    modifiedBy: adminUserId,
                }),
            ]);
        });

        test('cannot create a rule', async () => {
            await expect(
                nonAdminUserSdk.CreateAutomationRule({
                    rule: {
                        label: {
                            en: 'Test rule',
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
                        label: {
                            en: 'Test rule',
                        },
                        description: {
                            fr: 'regle de test',
                            en: 'This is a test rule',
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
                        label: {
                            en: 'updated label',
                        },
                        description: {
                            en: null,
                        },
                    },
                })
            ).updateAutomationRule;

            expect(updatedRule).toEqual(
                expect.objectContaining({
                    id: ruleToUpdate.id,
                    label: {
                        en: 'updated label',
                    },
                    description: {
                        fr: 'regle de test', // we verify mergeObjects is true
                    },
                }),
            );

            expect(updatedRule.description.en).toBeUndefined(); // we verify keepNull is false
            expect(updatedRule.modifiedAt).toBeGreaterThan(ruleToUpdate.modifiedAt);
        });

        test('cannot update a rule', async () => {
            await expect(
                nonAdminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        label: {
                            en: 'Test rule',
                        },
                    },
                }),
            ).rejects.toThrow('Action forbidden');
        });
    });
});
