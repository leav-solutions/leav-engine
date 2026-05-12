// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

export interface IAutomationRulesCache {
    getRulesToTrigger(
        event: {action: AutomationRuleEventAction; topic?: AutomationRulesEventTopic},
        synchronous: boolean,
        ctx: IQueryInfos,
    ): Promise<IAutomationRule[]>;
    invalidate(): Promise<void>;
}

export interface IAutomationRulesCacheDeps {
    'core.infra.cache.cacheService': ICachesService;
    'core.infra.automation.rule': IAutomationRuleRepo;
}

export default function ({
    'core.infra.cache.cacheService': cachesService,
    'core.infra.automation.rule': automationRuleRepo,
}: IAutomationRulesCacheDeps): IAutomationRulesCache {
    const _loadActiveRules = (ctx: IQueryInfos): Promise<IAutomationRule[]> =>
        cachesService.memoize({
            key: ACTIVE_RULES_CACHE_KEY,
            func: async () => {
                const res = await automationRuleRepo.getAutomationRules({filters: {active: true}}, ctx);
                return res.list;
            },
            ctx,
        });

    const _ruleMatchesEvent = (
        rule: IAutomationRule,
        event: {action: AutomationRuleEventAction; topic?: AutomationRulesEventTopic},
        synchronous: boolean,
    ): boolean => {
        if (rule.trigger.synchronous !== synchronous) {
            return false;
        }
        if (rule.trigger.eventAction !== event.action) {
            return false;
        }

        const ruleTopic = rule.trigger.eventTopic;
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
            const allActiveRules = await _loadActiveRules(ctx);
            return allActiveRules.filter(rule => _ruleMatchesEvent(rule, event, synchronous));
        },
        invalidate: () => cachesService.getCache(ECacheType.RAM).deleteData([ACTIVE_RULES_CACHE_KEY]),
    };
}
