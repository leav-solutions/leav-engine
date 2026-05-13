// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {
    type AutomationRuleEventTopic,
    type IAutomationRule,
    SyncAutomationRuleEventAction,
} from '../../_types/automation';
import {type IConfig} from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IAutomationRuleRepo} from '../../infra/automation/automationRuleRepo';
import {type ICachesService} from '../../infra/cache/cacheService';
import automationRulesCache from './automationRulesCache';

const mockCtx: IQueryInfos = {
    userId: '1',
    queryId: 'automationRulesCache.spec',
};

describe('automationRulesCache', () => {
    beforeEach(() => vi.clearAllMocks());

    const buildRule = (overrides: Partial<IAutomationRule>): IAutomationRule =>
        ({
            id: 'rule-id',
            label: 'rule',
            active: true,
            createdAt: 0,
            createdBy: 'system',
            modifiedAt: 0,
            modifiedBy: 'system',
            trigger: {
                synchronous: false,
                eventAction: EventAction.RECORD_SAVE,
                eventTopic: undefined,
            },
            pipeline: {steps: [], inputDataSchema: {}},
            ...overrides,
        }) as IAutomationRule;

    const buildCache = (rules: IAutomationRule[], cacheEnabled = true) => {
        const cachesService: Mockify<ICachesService> = {
            memoize: vi.fn().mockImplementation(({func}) => func()),
            getCache: vi.fn(),
        };

        const ruleRepo: Mockify<IAutomationRuleRepo> = {
            getAutomationRules: vi.fn().mockResolvedValue({list: rules, totalCount: rules.length}),
            getActiveAutomationRulesForCache: vi
                .fn()
                .mockResolvedValue(rules.map(r => ({id: r.id, trigger: r.trigger}))),
        };

        const config = {automation: {cache: {enable: cacheEnabled}}} as IConfig;

        const cache = automationRulesCache({
            'core.infra.cache.cacheService': cachesService as ICachesService,
            'core.infra.automation.rule': ruleRepo as IAutomationRuleRepo,
            config,
        });

        return {cache, cachesService, ruleRepo};
    };

    describe('getRulesToTrigger', () => {
        it('matches when rule has no eventTopic and action+sync align', async () => {
            const rule = buildRule({
                trigger: {synchronous: false, eventAction: EventAction.RECORD_SAVE},
            });
            const {cache} = buildCache([rule]);

            const matched = await cache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'lib'}},
                false,
                mockCtx,
            );

            expect(matched).toEqual([rule]);
        });

        it('matches when rule has empty eventTopic', async () => {
            const rule = buildRule({
                trigger: {synchronous: false, eventAction: EventAction.RECORD_SAVE, eventTopic: {}},
            });
            const {cache} = buildCache([rule]);

            const matched = await cache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'lib'}},
                false,
                mockCtx,
            );

            expect(matched).toEqual([rule]);
        });

        it('matches when a primitive topic field equals the event value', async () => {
            const rule = buildRule({
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });
            const {cache} = buildCache([rule]);

            const matched = await cache.getRulesToTrigger(
                {
                    action: EventAction.RECORD_SAVE,
                    topic: {library: 'products', record: {id: '1', libraryId: 'products'}},
                },
                false,
                mockCtx,
            );

            expect(matched).toEqual([rule]);
        });

        it('does not match when no rule topic field equals any event value', async () => {
            const rule = buildRule({
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'orders'},
                },
            });
            const {cache} = buildCache([rule]);

            const matched = await cache.getRulesToTrigger(
                {
                    action: EventAction.RECORD_SAVE,
                    topic: {library: 'products', record: {id: '1', libraryId: 'products'}},
                },
                false,
                mockCtx,
            );

            expect(matched).toEqual([]);
        });

        it('matches via OR semantics when one of several topic fields matches', async () => {
            const rule = buildRule({
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_SAVE,
                    eventTopic: {library: 'products', attribute: 'unrelated'},
                },
            });
            const {cache} = buildCache([rule]);

            const matched = await cache.getRulesToTrigger(
                {
                    action: EventAction.VALUE_SAVE,
                    topic: {library: 'products', attribute: 'color'},
                },
                false,
                mockCtx,
            );

            expect(matched).toEqual([rule]);
        });

        it('matches a nested record object via deep equality', async () => {
            const recordRef = {id: '42', libraryId: 'products'};
            const rule = buildRule({
                trigger: {
                    synchronous: true,
                    eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                    eventTopic: {record: recordRef},
                } as AutomationRuleEventTopic & IAutomationRule['trigger'],
            });
            const {cache} = buildCache([rule]);

            const matched = await cache.getRulesToTrigger(
                {
                    action: SyncAutomationRuleEventAction.RECORD_INIT,
                    topic: {library: 'products', record: {...recordRef}},
                },
                true,
                mockCtx,
            );

            expect(matched).toEqual([rule]);
        });

        it('skips rules with mismatched synchronous flag', async () => {
            const rule = buildRule({
                trigger: {synchronous: true, eventAction: EventAction.RECORD_SAVE},
            });
            const {cache} = buildCache([rule]);

            const matched = await cache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'lib'}},
                false,
                mockCtx,
            );

            expect(matched).toEqual([]);
        });

        it('skips rules with mismatched eventAction', async () => {
            const rule = buildRule({
                trigger: {synchronous: false, eventAction: EventAction.RECORD_DELETE},
            });
            const {cache} = buildCache([rule]);

            const matched = await cache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'lib'}},
                false,
                mockCtx,
            );

            expect(matched).toEqual([]);
        });

        it('does not match a rule constrained on topic when event has no topic', async () => {
            const rule = buildRule({
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });
            const {cache} = buildCache([rule]);

            const matched = await cache.getRulesToTrigger({action: EventAction.RECORD_SAVE}, false, mockCtx);

            expect(matched).toEqual([]);
        });
    });

    describe('with cache disabled', () => {
        it('delegates filtering to the repo AQL with partialMatchOnEventTopic: true', async () => {
            const rule = buildRule({
                id: 'rule-x',
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.RECORD_SAVE,
                    eventTopic: {library: 'products'},
                },
            });
            const {cache, ruleRepo} = buildCache([rule], false);

            const matched = await cache.getRulesToTrigger(
                {action: EventAction.RECORD_SAVE, topic: {library: 'products'}},
                false,
                mockCtx,
            );

            expect(ruleRepo.getAutomationRules).toHaveBeenCalledTimes(1);
            expect(ruleRepo.getAutomationRules).toHaveBeenCalledWith(
                {
                    filters: {
                        active: true,
                        trigger: {
                            synchronous: false,
                            eventAction: EventAction.RECORD_SAVE,
                            eventTopic: {library: 'products'},
                        },
                    },
                    partialMatchOnEventTopic: true,
                },
                mockCtx,
            );
            expect(matched).toEqual([rule]);
        });

        it('never calls memoize when the cache is disabled', async () => {
            const {cache, cachesService} = buildCache([], false);

            await cache.getRulesToTrigger({action: EventAction.RECORD_SAVE, topic: {library: 'any'}}, false, mockCtx);

            expect(cachesService.memoize).not.toHaveBeenCalled();
        });

        it('invalidate() is a no-op (no Redis call, does not throw)', async () => {
            const {cache, cachesService} = buildCache([], false);

            await expect(cache.invalidate('any-id')).resolves.toBeUndefined();
            await expect(cache.invalidate()).resolves.toBeUndefined();

            expect(cachesService.getCache).not.toHaveBeenCalled();
        });
    });
});
