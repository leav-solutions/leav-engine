// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from '../../../_types/queryInfos';
import {AUTOMATION_RULES_COLLECTION_NAME, type IAutomationRuleRepo} from '../../../infra/automation/automationRuleRepo';
import {SyncAutomationRuleEventAction} from '../../../_types/automation';
import {clearAllCollectionDocuments, getAutomationRuleRepo} from './integrationTestRepoUtils';

describe('automationRuleRepo', () => {
    let automationRuleRepo: IAutomationRuleRepo;
    const ctx: IQueryInfos = {
        userId: '1',
    };

    beforeAll(async () => {
        automationRuleRepo = getAutomationRuleRepo();
    });

    afterEach(async () => {
        await clearAllCollectionDocuments(AUTOMATION_RULES_COLLECTION_NAME);
    });

    describe('createAutomationRule', () => {
        it('should create an automation rule', async () => {
            const automationRule = await automationRuleRepo.createAutomationRule(
                {
                    label: {
                        en: 'Test Automation Rule',
                    },
                    description: {
                        en: 'This is a test automation rule.',
                    },
                    trigger: {
                        synchronous: false,
                        eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                    },
                },
                ctx,
            );

            expect(automationRule).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    label: {
                        en: 'Test Automation Rule',
                    },
                    description: {
                        en: 'This is a test automation rule.',
                    },
                    active: false,
                    createdAt: expect.any(Number),
                    createdBy: ctx.userId,
                    modifiedAt: expect.any(Number),
                    modifiedBy: ctx.userId,
                }),
            );
        });
    });

    describe('Several notifications existe', () => {
        let ruleIds: string[];

        beforeEach(async () => {
            ruleIds = [];
            // Create multiple rules for testing
            for (let i = 0; i < 4; i++) {
                const rule = await automationRuleRepo.createAutomationRule(
                    {
                        label: {
                            en: `Test Automation Rule ${i + 1}`,
                        },
                        trigger: {
                            synchronous: false,
                            eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                        },
                    },
                    ctx,
                );
                ruleIds.push(rule.id);
            }
        });

        describe('getAutomationRules', () => {
            it('should get all automation rules', async () => {
                const rules = await automationRuleRepo.getAutomationRules(
                    {
                        withCount: true,
                    },
                    ctx,
                );

                expect(rules.totalCount).toBe(ruleIds.length);
                expect(rules.list).toHaveLength(ruleIds.length);
            });

            it('should get automation rules by id', async () => {
                const rules = await automationRuleRepo.getAutomationRules(
                    {
                        filters: {
                            id: ruleIds[0],
                        },
                        withCount: true,
                    },
                    ctx,
                );

                expect(rules.totalCount).toBe(1);
                expect(rules.list).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: ruleIds[0],
                            label: {
                                en: 'Test Automation Rule 1',
                            },
                        }),
                    ]),
                );
            });
        });
    });
});
