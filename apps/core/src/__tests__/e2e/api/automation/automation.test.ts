// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {adminUserSdk, nonAdminUserSdk} from '../e2eUtils';

describe('Automation', () => {
    test('list rules (empty)', async () => {
        const rules = await adminUserSdk.GetAutomationRules();
        expect(rules.automationRules.list).toBeInstanceOf(Array);
    });

    test('create a rule', async () => {
        const newRule = await adminUserSdk.CreateAutomationRule({
            rule: {
                label: {
                    en: 'Test rule',
                },
                description: {
                    en: 'This is a test rule',
                },
            },
        });

        expect(newRule.createAutomationRule).toMatchObject({
            id: expect.any(String),
            label: {
                en: 'Test rule',
            },
        });

        const rules = await adminUserSdk.GetAutomationRules();
        expect(rules.automationRules.list).toEqual([
            expect.objectContaining({
                id: newRule.createAutomationRule.id,
                label: {
                    en: 'Test rule',
                },
                description: {
                    en: 'This is a test rule',
                },
            }),
        ]);
    });

    describe('non-admin user', () => {
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

        test('cannot list rules', async () => {
            await expect(nonAdminUserSdk.GetAutomationRules()).rejects.toThrow('Action forbidden');
        });
    });
});
