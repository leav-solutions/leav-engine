import {EventAction} from '@leav/utils';
import {systemUserId} from '../../../../_constants/users';
import {type ICreateAutomationRule} from '../../../../_types/automation';
import {type IConfig} from '../../../../_types/config';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import automationRulesCacheFactory, {
    INDEX_RULES_CACHE_KEY,
    ruleCacheKey,
    type IAutomationRulesCache,
} from '../../../../domain/automation/automationRulesCache';
import automationRuleRepoFactory, {
    AUTOMATION_RULES_COLLECTION_NAME,
    type IAutomationRuleRepo,
} from '../../../../infra/automation/automationRuleRepo';
import {ECacheType, type ICacheService, type ICachesService} from '../../../../infra/cache/cacheService';
import {clearAllCollectionDocuments} from '../../infra/integrationTestRepoUtils';
import {getCoreDep} from '../../integrationTestUtils';
import {type IDbService} from '../../../../infra/db/dbService';
import {type IDbUtils} from '../../../../infra/db/dbUtils';

// avoid conflict with apps/core/src/__tests__/integration/infra/automationRuleRepo.test.ts
const automationRuleCacheCollectionName = `cache_${AUTOMATION_RULES_COLLECTION_NAME}`;

describe('automationRulesCache', () => {
    let rulesCacheEnabled: IAutomationRulesCache;
    let rulesCacheDisabled: IAutomationRulesCache;
    let automationRuleRepo: IAutomationRuleRepo;
    let ramCache: ICacheService;

    const buildCtx = (): IQueryInfos => ({
        userId: systemUserId,
        queryId: `automationRulesCache-${Date.now()}-${Math.random()}`,
    });

    const makeRule = (overrides: Partial<ICreateAutomationRule> = {}) =>
        automationRuleRepo.createAutomationRule(
            {
                label: `rule-${Math.random()}`,
                active: true,
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_DELETE,
                },
                pipeline: {steps: []},
                ...overrides,
            },
            buildCtx(),
        );

    beforeAll(async () => {
        const cachesService = getCoreDep<ICachesService>('core.infra.cache.cacheService');
        const dbService = getCoreDep<IDbService>('core.infra.db.dbService');
        const dbUtils = getCoreDep<IDbUtils>('core.infra.db.dbUtils');
        ramCache = cachesService.getCache(ECacheType.RAM);
        automationRuleRepo = automationRuleRepoFactory(
            {'core.infra.db.dbService': dbService, 'core.infra.db.dbUtils': dbUtils},
            {collectionName: automationRuleCacheCollectionName},
        );
        await dbService.createCollection(automationRuleCacheCollectionName);

        rulesCacheEnabled = automationRulesCacheFactory({
            'core.infra.cache.cacheService': cachesService,
            'core.infra.automation.rule': automationRuleRepo,
            config: {automation: {cache: {enable: true}}} as IConfig,
        });
        rulesCacheDisabled = automationRulesCacheFactory({
            'core.infra.cache.cacheService': cachesService,
            'core.infra.automation.rule': automationRuleRepo,
            config: {automation: {cache: {enable: false}}} as IConfig,
        });
    });

    afterEach(async () => {
        await clearAllCollectionDocuments(automationRuleCacheCollectionName);
        await ramCache.deleteAll('automation:rules:*');
    });

    describe.each([
        {label: 'cache disabled', getCache: () => rulesCacheDisabled},
        {label: 'cache enabled', getCache: () => rulesCacheEnabled},
    ])('getRulesToTrigger — $label', ({getCache}) => {
        const recordRef42 = {id: '42', libraryId: 'products'};

        let ruleIds: Record<string, string>;

        beforeEach(async () => {
            ruleIds = {};

            const fixtures: Array<{key: string; overrides: Partial<ICreateAutomationRule>}> = [
                {
                    key: 'asyncNoTopic',
                    overrides: {
                        label: 'async-no-topic',
                        trigger: {synchronous: false, eventAction: EventAction.VALUE_DELETE},
                    },
                },
                {
                    key: 'asyncEmptyTopic',
                    overrides: {
                        label: 'async-empty-topic',
                        trigger: {synchronous: false, eventAction: EventAction.VALUE_DELETE, eventTopic: {}},
                    },
                },
                {
                    key: 'asyncLibProducts',
                    overrides: {
                        label: 'async-lib-products',
                        trigger: {
                            synchronous: false,
                            eventAction: EventAction.VALUE_DELETE,
                            eventTopic: {library: 'products'},
                        },
                    },
                },
                {
                    key: 'asyncLibOrders',
                    overrides: {
                        label: 'async-lib-orders',
                        trigger: {
                            synchronous: false,
                            eventAction: EventAction.VALUE_DELETE,
                            eventTopic: {library: 'orders'},
                        },
                    },
                },
                {
                    key: 'asyncLibAttrColor',
                    overrides: {
                        label: 'async-lib-attr-color',
                        trigger: {
                            synchronous: false,
                            eventAction: EventAction.VALUE_SAVE,
                            eventTopic: {library: 'products', attribute: 'color'},
                        },
                    },
                },
                {
                    key: 'asyncRecordDelete',
                    overrides: {
                        label: 'async-record-delete',
                        trigger: {synchronous: false, eventAction: EventAction.RECORD_DELETE},
                    },
                },
                {
                    key: 'inactiveAsyncLibProducts',
                    overrides: {
                        label: 'inactive-async-lib-products',
                        active: false,
                        trigger: {
                            synchronous: false,
                            eventAction: EventAction.VALUE_DELETE,
                            eventTopic: {library: 'products'},
                        },
                    },
                },
                {
                    key: 'syncNoTopic',
                    overrides: {
                        label: 'sync-no-topic',
                        trigger: {synchronous: true, eventAction: EventAction.VALUE_DELETE},
                    },
                },
                {
                    key: 'syncRecordRef',
                    overrides: {
                        label: 'sync-record-ref',
                        trigger: {
                            synchronous: true,
                            eventAction: EventAction.RECORD_INIT,
                            eventTopic: {record: recordRef42},
                        },
                    },
                },
            ];

            for (const {key, overrides} of fixtures) {
                const rule = await makeRule(overrides);
                ruleIds[key] = rule.id;
            }
        });

        const matchedKeys = (matched: Array<{id: string}>): string[] =>
            matched.map(r => Object.entries(ruleIds).find(([, id]) => id === r.id)?.[0] ?? 'UNKNOWN').sort();

        it('matches all async no-topic / empty-topic rules on action+sync, ignoring topic-constrained rules with unrelated topic', async () => {
            const matched = await getCache().getRulesToTrigger(
                {action: EventAction.VALUE_DELETE, topic: {library: 'lib'}},
                false,
                buildCtx(),
            );

            expect(matchedKeys(matched)).toEqual(['asyncEmptyTopic', 'asyncNoTopic']);
        });

        it('matches when a primitive topic field equals the event value', async () => {
            const matched = await getCache().getRulesToTrigger(
                {
                    action: EventAction.VALUE_DELETE,
                    topic: {library: 'products', record: {id: '1', libraryId: 'products'}},
                },
                false,
                buildCtx(),
            );

            expect(matchedKeys(matched)).toEqual(['asyncEmptyTopic', 'asyncLibProducts', 'asyncNoTopic']);
        });

        it('does not match topic-constrained rules when no rule topic field equals any event value', async () => {
            const matched = await getCache().getRulesToTrigger(
                {action: EventAction.VALUE_DELETE, topic: {library: 'nonexistent'}},
                false,
                buildCtx(),
            );

            expect(matchedKeys(matched)).toEqual(['asyncEmptyTopic', 'asyncNoTopic']);
        });

        it('requires AND semantics across all rule topic fields', async () => {
            const matched = await getCache().getRulesToTrigger(
                {action: EventAction.VALUE_SAVE, topic: {library: 'products', attribute: 'unrelated'}},
                false,
                buildCtx(),
            );

            // No VALUE_SAVE rule with a topic that fully matches; no async-no-topic rule on VALUE_SAVE either.
            expect(matchedKeys(matched)).toEqual([]);
        });

        it('matches a nested record object via deep equality', async () => {
            const matched = await getCache().getRulesToTrigger(
                {
                    action: EventAction.RECORD_INIT,
                    topic: {library: 'products', record: {...recordRef42}},
                },
                true,
                buildCtx(),
            );

            expect(matchedKeys(matched)).toEqual(['syncRecordRef']);
        });

        it('skips rules with mismatched synchronous flag', async () => {
            const matched = await getCache().getRulesToTrigger(
                {action: EventAction.VALUE_DELETE, topic: {library: 'products'}},
                true,
                buildCtx(),
            );

            // syncNoTopic is the only sync rule with action VALUE_DELETE.
            expect(matchedKeys(matched)).toEqual(['syncNoTopic']);
        });

        it('skips rules with mismatched eventAction', async () => {
            const matched = await getCache().getRulesToTrigger(
                {action: EventAction.TREE_SAVE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );

            expect(matchedKeys(matched)).toEqual([]);
        });

        it('excludes inactive rules even when action and topic match', async () => {
            const matched = await getCache().getRulesToTrigger(
                {action: EventAction.VALUE_DELETE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );

            expect(matchedKeys(matched)).not.toContain('inactiveAsyncLibProducts');
            expect(matchedKeys(matched)).toEqual(['asyncEmptyTopic', 'asyncLibProducts', 'asyncNoTopic']);
        });

        it('routes rules to the correct synchronous channel', async () => {
            const matchedSync = await getCache().getRulesToTrigger(
                {action: EventAction.RECORD_INIT, topic: {library: 'products', record: recordRef42}},
                true,
                buildCtx(),
            );
            expect(matchedKeys(matchedSync)).toEqual(['syncRecordRef']);

            const matchedAsync = await getCache().getRulesToTrigger(
                {action: EventAction.RECORD_INIT, topic: {library: 'products', record: recordRef42}},
                false,
                buildCtx(),
            );
            expect(matchedKeys(matchedAsync)).toEqual([]);
        });
    });

    describe('cache mechanics — cache enabled only', () => {
        it('populates the index with only {id, trigger} and the per-rule key with the full rule', async () => {
            const rule = await makeRule({
                label: 'rule-cached',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_DELETE,
                    eventTopic: {library: 'products'},
                },
                pipeline: {steps: [{type: 'log', params: {message: 'hi', level: 'info'}}]},
            });

            const matched = await rulesCacheEnabled.getRulesToTrigger(
                {
                    action: EventAction.VALUE_DELETE,
                    topic: {library: 'products', record: {id: '1', libraryId: 'products'}},
                },
                false,
                buildCtx(),
            );

            expect(matched).toHaveLength(1);
            expect(matched[0].id).toBe(rule.id);

            const [rawIndex, rawRule] = await ramCache.getData([INDEX_RULES_CACHE_KEY, ruleCacheKey(rule.id)]);

            expect(rawIndex).not.toBeNull();
            const cachedIndex = JSON.parse(rawIndex as string);
            expect(cachedIndex).toEqual([{id: rule.id, trigger: rule.trigger}]);
            expect(cachedIndex[0]).not.toHaveProperty('pipeline');
            expect(cachedIndex[0]).not.toHaveProperty('label');

            expect(rawRule).not.toBeNull();
            const cachedRule = JSON.parse(rawRule as string);
            expect(cachedRule.id).toBe(rule.id);
            expect(cachedRule.pipeline).toEqual(rule.pipeline);
            expect(cachedRule.label).toBe(rule.label);
        });

        it('targeted invalidate(ruleId) deletes only the index and that rule, preserving others', async () => {
            const ruleA = await makeRule({
                label: 'rule-A',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_DELETE,
                    eventTopic: {library: 'products'},
                },
            });
            const ruleB = await makeRule({
                label: 'rule-B',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_DELETE,
                    eventTopic: {library: 'products'},
                },
            });

            await rulesCacheEnabled.getRulesToTrigger(
                {action: EventAction.VALUE_DELETE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );

            const [idxBefore, aBefore, bBefore] = await ramCache.getData([
                INDEX_RULES_CACHE_KEY,
                ruleCacheKey(ruleA.id),
                ruleCacheKey(ruleB.id),
            ]);
            expect(idxBefore).not.toBeNull();
            expect(aBefore).not.toBeNull();
            expect(bBefore).not.toBeNull();

            await rulesCacheEnabled.invalidate(ruleA.id);

            const [idxAfter, aAfter, bAfter] = await ramCache.getData([
                INDEX_RULES_CACHE_KEY,
                ruleCacheKey(ruleA.id),
                ruleCacheKey(ruleB.id),
            ]);
            expect(idxAfter).toBeNull();
            expect(aAfter).toBeNull();
            expect(bAfter).not.toBeNull();
        });

        it('silently skips a matched rule that no longer exists in the repo (race condition)', async () => {
            const ruleA = await makeRule({
                label: 'rule-ghost',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_DELETE,
                    eventTopic: {library: 'products'},
                },
            });
            const ruleB = await makeRule({
                label: 'rule-survivor',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_DELETE,
                    eventTopic: {library: 'products'},
                },
            });

            await rulesCacheEnabled.getRulesToTrigger(
                {action: EventAction.VALUE_DELETE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );

            await automationRuleRepo.deleteAutomationRule(ruleA.id, buildCtx());
            await ramCache.deleteData([ruleCacheKey(ruleA.id)]);

            const matched = await rulesCacheEnabled.getRulesToTrigger(
                {action: EventAction.VALUE_DELETE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );

            expect(matched.map(r => r.id)).toEqual([ruleB.id]);
        });

        it('serves the cached snapshot — a direct repo insert is invisible until invalidate()', async () => {
            const ruleA = await makeRule({
                label: 'rule-A',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_DELETE,
                    eventTopic: {library: 'products'},
                },
            });

            const firstCall = await rulesCacheEnabled.getRulesToTrigger(
                {action: EventAction.VALUE_DELETE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );
            expect(firstCall.map(r => r.id)).toEqual([ruleA.id]);

            const ruleB = await makeRule({
                label: 'rule-B',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_DELETE,
                    eventTopic: {library: 'products'},
                },
            });

            const secondCall = await rulesCacheEnabled.getRulesToTrigger(
                {action: EventAction.VALUE_DELETE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );
            expect(secondCall.map(r => r.id)).toEqual([ruleA.id]);
            expect(secondCall.map(r => r.id)).not.toContain(ruleB.id);
        });

        it('invalidate() clears the Redis key and forces a fresh repo read', async () => {
            const ruleA = await makeRule({
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_DELETE,
                    eventTopic: {library: 'products'},
                },
            });

            await rulesCacheEnabled.getRulesToTrigger(
                {action: EventAction.VALUE_DELETE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );

            const ruleB = await makeRule({
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_DELETE,
                    eventTopic: {library: 'products'},
                },
            });

            await rulesCacheEnabled.invalidate();

            const [rawAfterInvalidate] = await ramCache.getData([INDEX_RULES_CACHE_KEY]);
            expect(rawAfterInvalidate).toBeNull();

            const afterInvalidate = await rulesCacheEnabled.getRulesToTrigger(
                {action: EventAction.VALUE_DELETE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );
            expect(afterInvalidate.map(r => r.id).sort()).toEqual([ruleA.id, ruleB.id].sort());
        });
    });
});
