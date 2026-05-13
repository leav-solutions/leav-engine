import {logger} from '@leav/logger';
import {isDeepStrictEqual} from 'node:util';
import {
    type AutomationRuleEventAction,
    type AutomationRuleIndexEntry,
    type AutomationRuleEventTopic,
    type IAutomationRule,
} from '../../_types/automation';
import {type IConfig} from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IAutomationRuleRepo} from '../../infra/automation/automationRuleRepo';
import {ECacheType, type ICachesService} from '../../infra/cache/cacheService';

/**
 * Two-tier cache for automation rules, shared across every `core` replica
 * via Redis.
 *
 * ## Structure
 *
 * 1. **Index** under the key `automation:rules:index` → `AutomationRuleIndexEntry[]`
 *    (= `Pick<IAutomationRule, 'id' | 'trigger'>[]`). Holds the bare minimum
 *    needed to decide which rules match an event (action, sync, topic).
 *    Built on the ArangoDB side via a dedicated AQL projection
 *    (`automationRuleRepo.getActiveAutomationRulesForCache`) — pipelines and
 *    metadata never leave the Arango server.
 *
 * 2. **Per-rule cache** under `automation:rules:{ruleId}` → the full
 *    `IAutomationRule` (pipeline included). Populated **lazily**: only a rule
 *    that is actually matched by an event triggers the fetch + caching of its
 *    full payload.
 *
 * ## Why this split
 *
 * Selecting which rules to execute only depends on `trigger`; the `pipeline`
 * is only required when the rule actually runs. With a naive "full-list"
 * cache, every event would load all pipelines (potentially large) to execute
 * 0 to a handful of them. The lightweight index bounds the selection cost to
 * an `{id, trigger}` payload × number of active rules; only the pipelines of
 * matching rules are fetched.
 *
 * ## Targeted invalidation
 *
 * `invalidate(ruleId)` removes only `[INDEX_RULES_CACHE_KEY,
 * ruleCacheKey(ruleId)]`. Other rules keep their Redis entry intact — their
 * pipelines are not reloaded until a modification targets them. Relevant
 * when an admin edits a single rule among dozens (the typical case).
 *
 * `invalidate()` without an argument performs a full wipe via the
 * `RULES_CACHE_KEYS_PATTERN` glob (useful for tests and global admin purges).
 *
 * ## Lazy per-rule population (not eager)
 *
 * On an index rebuild, per-rule caches are NOT re-written. Otherwise,
 * re-writing every rule on each modification would defeat the "preserve
 * other rules" guarantee. Acceptable trade-off: if a matched rule has never
 * been cached, `_loadRuleById` performs an extra repo fetch — the debt is
 * amortized by subsequent hits.
 */

export const INDEX_RULES_CACHE_KEY = 'automation:rules:index';
export const RULES_CACHE_KEYS_PATTERN = 'automation:rules:*';

export const ruleCacheKey = (id: string): string => `automation:rules:${id}`;

export interface IAutomationRulesCache {
    getRulesToTrigger(
        event: {action: AutomationRuleEventAction; topic?: AutomationRuleEventTopic},
        synchronous: boolean,
        ctx: IQueryInfos,
    ): Promise<IAutomationRule[]>;
    invalidate(ruleId?: string): Promise<void>;
}

export interface IAutomationRulesCacheDeps {
    'core.infra.cache.cacheService': ICachesService;
    'core.infra.automation.rule': IAutomationRuleRepo;
    config: IConfig;
}

export default function ({
    'core.infra.cache.cacheService': cachesService,
    'core.infra.automation.rule': automationRuleRepo,
    config,
}: IAutomationRulesCacheDeps): IAutomationRulesCache {
    if (config.automation.cache.enable === false) {
        return automationCacheDisabled({automationRuleRepo});
    }

    const _loadIndex = (ctx: IQueryInfos): Promise<AutomationRuleIndexEntry[]> =>
        cachesService.memoize<AutomationRuleIndexEntry[]>({
            key: INDEX_RULES_CACHE_KEY,
            func: () => automationRuleRepo.getActiveAutomationRulesForCache(ctx),
            ctx,
        });

    const _loadRuleById = (id: string, ctx: IQueryInfos): Promise<IAutomationRule | null> =>
        cachesService.memoize<IAutomationRule | null>({
            key: ruleCacheKey(id),
            func: async () => {
                const res = await automationRuleRepo.getAutomationRules({filters: {id}}, ctx);
                return res.list[0] ?? null;
            },
            ctx,
        });

    const _indexEntryMatchesEvent = (
        entry: AutomationRuleIndexEntry,
        event: {action: AutomationRuleEventAction; topic?: AutomationRuleEventTopic},
        synchronous: boolean,
    ): boolean => {
        if (entry.trigger.synchronous !== synchronous) {
            return false;
        }
        if (entry.trigger.eventAction !== event.action) {
            return false;
        }

        const ruleTopic = entry.trigger.eventTopic;
        if (!ruleTopic || Object.keys(ruleTopic).length === 0) {
            return true;
        }
        if (!event.topic) {
            return false;
        }

        const eventTopic = event.topic as Record<string, unknown>;
        return Object.entries(ruleTopic).some(([key, value]) => isDeepStrictEqual(eventTopic[key], value));
    };

    return {
        getRulesToTrigger: async (event, synchronous, ctx) => {
            const index = await _loadIndex(ctx);
            const matchingIds = index
                .filter(entry => _indexEntryMatchesEvent(entry, event, synchronous))
                .map(entry => entry.id);

            const rules = await Promise.all(
                matchingIds.map(async id => {
                    try {
                        return await _loadRuleById(id, ctx);
                    } catch (err) {
                        logger.warn(
                            `Skipping rule ${id} in getRulesToTrigger: ${err instanceof Error ? err.message : String(err)}`,
                        );
                        return null;
                    }
                }),
            );
            return rules.filter((r): r is IAutomationRule => r !== null);
        },
        invalidate: async ruleId => {
            const keys = ruleId ? [INDEX_RULES_CACHE_KEY, ruleCacheKey(ruleId)] : [RULES_CACHE_KEYS_PATTERN];
            await cachesService.getCache(ECacheType.RAM).deleteData(keys);
        },
    };
}

function automationCacheDisabled({
    automationRuleRepo,
}: {
    automationRuleRepo: IAutomationRuleRepo;
}): IAutomationRulesCache {
    logger.verbose('Automation rules cache is disabled in the configuration.');

    return {
        getRulesToTrigger: async (event, synchronous, ctx) => {
            const rules = await automationRuleRepo.getAutomationRules(
                {
                    filters: {
                        active: true,
                        trigger: {
                            synchronous,
                            eventAction: event.action,
                            eventTopic: event.topic,
                        },
                    },
                    partialMatchOnEventTopic: true,
                },
                ctx,
            );
            return rules.list;
        },
        invalidate: async () => {
            /* no-op: cache is disabled */
        },
    };
}
