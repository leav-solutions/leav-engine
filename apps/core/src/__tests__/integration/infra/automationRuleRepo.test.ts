// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from '../../../_types/queryInfos';
import {AUTOMATION_RULES_COLLECTION_NAME, type IAutomationRuleRepo} from '../../../infra/automation/automationRuleRepo';
import {type AutomationRulesEventTopic, SyncAutomationRuleEventAction} from '../../../_types/automation';
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
                    label: 'Test Automation Rule',
                    description: 'This is a test automation rule.',
                    trigger: {
                        synchronous: false,
                        eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                    },
                    pipeline: {
                        steps: [],
                    },
                },
                ctx,
            );

            expect(automationRule).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    label: 'Test Automation Rule',
                    description: 'This is a test automation rule.',
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
                        label: `Test Automation Rule ${i + 1}`,
                        trigger: {
                            synchronous: false,
                            eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                        },
                        pipeline: {
                            steps: [],
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
                            label: 'Test Automation Rule 1',
                        }),
                    ]),
                );
            });
        });
    });

    describe('getAutomationRules with partialMatchOnEventTopic', () => {
        const libraryId = 'my_library';
        const attributeId = 'my_attribute';

        const makeRule = (label: string, eventTopic: AutomationRulesEventTopic) =>
            automationRuleRepo.createAutomationRule(
                {
                    label,
                    trigger: {synchronous: false, eventAction: SyncAutomationRuleEventAction.RECORD_INIT, eventTopic},
                    pipeline: {steps: []},
                },
                ctx,
            );

        beforeEach(async () => {
            await makeRule('Rule with library topic', {library: libraryId});
            await makeRule('Rule with attribute topic', {attribute: attributeId});
            await makeRule('Rule with library and attribute topic', {library: libraryId, attribute: attributeId});
            await makeRule('Rule with unrelated topic', {library: 'other_library'});
        });

        it('should return rules where at least one eventTopic field matches', async () => {
            const rules = await automationRuleRepo.getAutomationRules(
                {
                    filters: {
                        trigger: {
                            eventTopic: {library: libraryId, attribute: attributeId},
                        },
                    },
                    partialMatchOnEventTopic: true,
                    withCount: true,
                },
                ctx,
            );

            expect(rules.totalCount).toBe(3);
            expect(rules.list.map(r => r.label)).toEqual(
                expect.arrayContaining([
                    'Rule with library topic',
                    'Rule with attribute topic',
                    'Rule with library and attribute topic',
                ]),
            );
        });

        it('should return only the exact-matching rule when partialMatchOnEventTopic is false', async () => {
            const rules = await automationRuleRepo.getAutomationRules(
                {
                    filters: {
                        trigger: {
                            eventTopic: {library: libraryId, attribute: attributeId},
                        },
                    },
                    partialMatchOnEventTopic: false,
                    withCount: true,
                },
                ctx,
            );

            expect(rules.totalCount).toBe(1);
            expect(rules.list[0].label).toBe('Rule with library and attribute topic');
        });

        it('should return no rules when no eventTopic field matches in partial mode', async () => {
            const rules = await automationRuleRepo.getAutomationRules(
                {
                    filters: {
                        trigger: {
                            eventTopic: {library: 'nonexistent_library'},
                        },
                    },
                    partialMatchOnEventTopic: true,
                    withCount: true,
                },
                ctx,
            );

            expect(rules.totalCount).toBe(0);
            expect(rules.list).toHaveLength(0);
        });

        it('should ignore partialMatchOnEventTopic when no eventTopic filter is provided', async () => {
            const rules = await automationRuleRepo.getAutomationRules(
                {
                    filters: {
                        trigger: {
                            eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                        },
                    },
                    partialMatchOnEventTopic: true,
                    withCount: true,
                },
                ctx,
            );

            expect(rules.totalCount).toBe(4);
        });
    });
});
