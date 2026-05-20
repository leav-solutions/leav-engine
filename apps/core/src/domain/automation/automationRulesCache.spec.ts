import {EventAction} from '@leav/utils';
import {type IAutomationRule} from '../../_types/automation';
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

    describe('getRulesToTrigger — edge case: event has no topic', () => {
        // Covered as a unit test only: in cache-disabled mode this scenario would
        // crash the AQL filter on `Object.entries(undefined)`. Not a production
        // path (events emitted by eventsManager always carry a topic).
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
