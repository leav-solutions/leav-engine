import {type IQueryInfos} from '../../../_types/queryInfos';
import {AUTOMATION_RULES_COLLECTION_NAME, type IAutomationRuleRepo} from '../../../infra/automation/automationRuleRepo';
import {type AutomationRuleEventTopic, SyncAutomationRuleEventAction} from '../../../_types/automation';
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
                    active: false,
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
                    active: false,
                    description: 'This is a test automation rule.',
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
                        active: false,
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

    describe('getActiveAutomationRulesForCache', () => {
        it('returns only active rules', async () => {
            const createdActive = await automationRuleRepo.createAutomationRule(
                {
                    label: 'Active rule',
                    active: true,
                    trigger: {
                        synchronous: false,
                        eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                    },
                    pipeline: {steps: []},
                },
                ctx,
            );
            await automationRuleRepo.createAutomationRule(
                {
                    label: 'Inactive rule',
                    active: false,
                    trigger: {
                        synchronous: false,
                        eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                    },
                    pipeline: {steps: []},
                },
                ctx,
            );

            const entries = await automationRuleRepo.getActiveAutomationRulesForCache(ctx);

            expect(entries).toHaveLength(1);
            expect(entries).toEqual(
                expect.arrayContaining([
                    {
                        id: createdActive.id,
                        trigger: {
                            synchronous: false,
                            eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                        },
                    },
                ]),
            );
        });

        it('projects each entry to only {id, trigger} — no pipeline, no metadata', async () => {
            const created = await automationRuleRepo.createAutomationRule(
                {
                    label: 'rule-projection',
                    description: 'should not leak',
                    active: true,
                    trigger: {
                        synchronous: false,
                        eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                        eventTopic: {library: 'products'},
                    },
                    pipeline: {steps: [{type: 'log', params: {message: 'leaky', level: 'info'}}]},
                },
                ctx,
            );

            const entries = await automationRuleRepo.getActiveAutomationRulesForCache(ctx);

            expect(entries).toHaveLength(1);
            expect(entries).toEqual(
                expect.arrayContaining([
                    {
                        id: created.id,
                        trigger: {
                            synchronous: false,
                            eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {library: 'products'},
                        },
                    },
                ]),
            );
        });

        it('preserves the full trigger payload (synchronous, eventAction, eventTopic)', async () => {
            await automationRuleRepo.createAutomationRule(
                {
                    label: 'rule-trigger',
                    active: true,
                    trigger: {
                        synchronous: true,
                        eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                        eventTopic: {library: 'products', attribute: 'color'},
                    },
                    pipeline: {steps: []},
                },
                ctx,
            );

            const [entry] = await automationRuleRepo.getActiveAutomationRulesForCache(ctx);

            expect(entry.trigger).toEqual({
                synchronous: true,
                eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                eventTopic: {library: 'products', attribute: 'color'},
            });
        });
    });

    describe('getAutomationRules with partialMatchOnEventTopic', () => {
        const libraryId = 'my_library';
        const attributeId = 'my_attribute';
        const treeId = 'my_tree';

        const makeRule = (label: string, eventTopic: AutomationRuleEventTopic) =>
            automationRuleRepo.createAutomationRule(
                {
                    label,
                    trigger: {synchronous: false, eventAction: SyncAutomationRuleEventAction.RECORD_INIT, eventTopic},
                    pipeline: {steps: []},
                    active: false,
                },
                ctx,
            );

        beforeEach(async () => {
            await makeRule('Rule with library topic', {library: libraryId});
            await makeRule('Rule with attribute topic', {attribute: attributeId});
            await makeRule('Rule with library and attribute topic', {library: libraryId, attribute: attributeId});
            await makeRule('Rule with unrelated topic', {library: 'other_library'});
            await makeRule('Rule with extra tree key', {library: libraryId, tree: treeId});
            await makeRule('Rule with empty eventTopic', {});
        });

        it('returns rules whose eventTopic keys are a subset of the filter and whose values match', async () => {
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

            expect(rules.list).toHaveLength(4);
            expect(rules.list.map(r => r.label)).toEqual(
                expect.arrayContaining([
                    'Rule with library topic',
                    'Rule with attribute topic',
                    'Rule with library and attribute topic',
                    'Rule with empty eventTopic',
                ]),
            );
            expect(rules.totalCount).toBe(4);
        });

        it('rejects rules that contain an eventTopic key not present in the filter', async () => {
            const rules = await automationRuleRepo.getAutomationRules(
                {
                    filters: {
                        trigger: {
                            eventTopic: {library: libraryId},
                        },
                    },
                    partialMatchOnEventTopic: true,
                    withCount: true,
                },
                ctx,
            );

            expect(rules.list).toHaveLength(2);
            expect(rules.list.map(r => r.label)).toEqual(
                expect.arrayContaining(['Rule with library topic', 'Rule with empty eventTopic']),
            );
            expect(rules.totalCount).toBe(2);
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

            expect(rules.list).toHaveLength(1);
            expect(rules.list.map(r => r.label)).toEqual(
                expect.arrayContaining(['Rule with library and attribute topic']),
            );
            expect(rules.totalCount).toBe(1);
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

            expect(rules.list).toHaveLength(1);
            expect(rules.list.map(r => r.label)).toEqual(expect.arrayContaining(['Rule with empty eventTopic']));
            expect(rules.totalCount).toBe(1);
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

            expect(rules.totalCount).toBe(6);
        });
    });
});
