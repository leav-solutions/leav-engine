// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {isDeepStrictEqual} from 'node:util';
import {
    type AutomationRuleEventAction,
    type AutomationRulesEventTopic,
    type IAutomationRule,
} from '../../_types/automation';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IAutomationRuleRepo} from '../../infra/automation/automationRuleRepo';
import {ECacheType, type ICachesService} from '../../infra/cache/cacheService';

export const ACTIVE_RULES_CACHE_KEY = 'automation:rules:active';
export const RULES_CACHE_KEYS_PATTERN = 'automation:rules:*';

export const ruleCacheKey = (id: string): string => `automation:rules:${id}`;

export type AutomationRuleIndexEntry = Pick<IAutomationRule, 'id' | 'trigger'>;

export interface IAutomationRulesCache {
    getRulesToTrigger(
        event: {action: AutomationRuleEventAction; topic?: AutomationRulesEventTopic},
        synchronous: boolean,
        ctx: IQueryInfos,
    ): Promise<IAutomationRule[]>;
    invalidate(ruleId?: string): Promise<void>;
}

export interface IAutomationRulesCacheDeps {
    'core.infra.cache.cacheService': ICachesService;
    'core.infra.automation.rule': IAutomationRuleRepo;
}

export default function ({
    'core.infra.cache.cacheService': cachesService,
    'core.infra.automation.rule': automationRuleRepo,
}: IAutomationRulesCacheDeps): IAutomationRulesCache {
    const _loadIndex = (ctx: IQueryInfos): Promise<AutomationRuleIndexEntry[]> =>
        cachesService.memoize<AutomationRuleIndexEntry[]>({
            key: ACTIVE_RULES_CACHE_KEY,
            func: async () => {
                const res = await automationRuleRepo.getAutomationRules({filters: {active: true}}, ctx);
                return res.list.map(rule => ({id: rule.id, trigger: rule.trigger}));
            },
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
        event: {action: AutomationRuleEventAction; topic?: AutomationRulesEventTopic},
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
            const keys = ruleId ? [ACTIVE_RULES_CACHE_KEY, ruleCacheKey(ruleId)] : [RULES_CACHE_KEYS_PATTERN];
            await cachesService.getCache(ECacheType.RAM).deleteData(keys);
        },
    };
}
