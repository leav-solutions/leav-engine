// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {systemUserId} from '../../../../_constants/users';
import {type ICreateAutomationRule, SyncAutomationRuleEventAction} from '../../../../_types/automation';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {
    INDEX_RULES_CACHE_KEY,
    ruleCacheKey,
    type IAutomationRulesCache,
} from '../../../../domain/automation/automationRulesCache';
import {
    AUTOMATION_RULES_COLLECTION_NAME,
    type IAutomationRuleRepo,
} from '../../../../infra/automation/automationRuleRepo';
import {ECacheType, type ICacheService, type ICachesService} from '../../../../infra/cache/cacheService';
import {clearAllCollectionDocuments, getAutomationRuleRepo} from '../../infra/integrationTestRepoUtils';
import {getCoreDep} from '../../integrationTestUtils';

describe('automationRulesCache', () => {
    let rulesCache: IAutomationRulesCache;
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
                    eventAction: EventAction.RECORD_SAVE,
                },
                pipeline: {steps: []},
                ...overrides,
            },
            buildCtx(),
        );

    beforeAll(() => {
        rulesCache = getCoreDep<IAutomationRulesCache>('core.domain.automation.rulesCache');
        automationRuleRepo = getAutomationRuleRepo();
        ramCache = getCoreDep<ICachesService>('core.infra.cache.cacheService').getCache(ECacheType.RAM);
    });

    afterEach(async () => {
        await clearAllCollectionDocuments(AUTOMATION_RULES_COLLECTION_NAME);
        await ramCache.deleteAll('automation:rules:*');
    });

    describe('getRulesToTrigger — Arango → Redis chain', () => {
        it('returns [] when no rule is persisted', async () => {
            const matched = await rulesCache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'any'}},
                false,
                buildCtx(),
            );

            expect(matched).toEqual([]);
        });

        it('populates the index with only {id, trigger} and the per-rule key with the full rule', async () => {
            const rule = await makeRule({
                label: 'rule-cached',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
                pipeline: {steps: [{type: 'log', params: {message: 'hi', level: 'info'}}]},
            });

            const matched = await rulesCache.getRulesToTrigger(
                {
                    action: EventAction.RECORD_SAVE,
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
            // The index entry must not carry the pipeline.
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
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });
            const ruleB = await makeRule({
                label: 'rule-B',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });

            await rulesCache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'products'}},
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

            await rulesCache.invalidate(ruleA.id);

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
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });
            const ruleB = await makeRule({
                label: 'rule-survivor',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });

            // Prime the index (it now references both A and B).
            await rulesCache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );

            // Delete A directly via the repo (bypass the domain → cache not invalidated)
            // and evict A from the per-rule cache to force a repo lookup on next access.
            await automationRuleRepo.deleteAutomationRule(ruleA.id, buildCtx());
            await ramCache.deleteData([ruleCacheKey(ruleA.id)]);

            const matched = await rulesCache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'products'}},
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
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });

            const firstCall = await rulesCache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );
            expect(firstCall.map(r => r.id)).toEqual([ruleA.id]);

            // Insert a 2nd rule directly via the repo: bypasses the domain, no invalidation.
            const ruleB = await makeRule({
                label: 'rule-B',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });

            const secondCall = await rulesCache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'products'}},
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
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });

            await rulesCache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );

            const ruleB = await makeRule({
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });

            await rulesCache.invalidate();

            const [rawAfterInvalidate] = await ramCache.getData([INDEX_RULES_CACHE_KEY]);
            expect(rawAfterInvalidate).toBeNull();

            const afterInvalidate = await rulesCache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );
            expect(afterInvalidate.map(r => r.id).sort()).toEqual([ruleA.id, ruleB.id].sort());
        });

        it('excludes inactive rules even when action and topic match', async () => {
            await makeRule({
                label: 'inactive-rule',
                active: false,
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });
            const activeRule = await makeRule({
                label: 'active-rule',
                active: true,
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });

            const matched = await rulesCache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'products'}},
                false,
                buildCtx(),
            );

            expect(matched.map(r => r.id)).toEqual([activeRule.id]);
        });

        it('matches rules whose topic fields OR-match the event topic, ignoring others', async () => {
            const ruleLibA = await makeRule({
                label: 'rule-lib-A',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'A'},
                },
            });
            await makeRule({
                label: 'rule-lib-B',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'B'},
                },
            });
            const ruleLibAAttr = await makeRule({
                label: 'rule-lib-A-attr',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'A', attribute: 'attr1'},
                },
            });
            const ruleNoTopic = await makeRule({
                label: 'rule-no-topic',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                },
            });

            const matched = await rulesCache.getRulesToTrigger(
                {
                    action: EventAction.RECORD_SAVE,
                    topic: {library: 'A', record: {id: '1', libraryId: 'A'}},
                },
                false,
                buildCtx(),
            );

            expect(matched.map(r => r.id).sort()).toEqual([ruleLibA.id, ruleLibAAttr.id, ruleNoTopic.id].sort());
        });

        it('routes rules based on synchronous flag', async () => {
            const syncRule = await makeRule({
                label: 'sync-rule',
                trigger: {
                    synchronous: true,
                    eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                    eventTopic: {library: 'products'},
                },
            });
            const asyncRule = await makeRule({
                label: 'async-rule',
                trigger: {
                    synchronous: false,
                    eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                    eventTopic: {library: 'products'},
                },
            });

            const matchedSync = await rulesCache.getRulesToTrigger(
                {action: SyncAutomationRuleEventAction.RECORD_INIT, topic: {library: 'products'}},
                true,
                buildCtx(),
            );
            expect(matchedSync.map(r => r.id)).toEqual([syncRule.id]);

            await rulesCache.invalidate();

            const matchedAsync = await rulesCache.getRulesToTrigger(
                {action: SyncAutomationRuleEventAction.RECORD_INIT, topic: {library: 'products'}},
                false,
                buildCtx(),
            );
            expect(matchedAsync.map(r => r.id)).toEqual([asyncRule.id]);
        });
    });
});
