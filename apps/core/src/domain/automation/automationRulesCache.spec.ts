// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {
    type AutomationRulesEventTopic,
    type IAutomationRule,
    SyncAutomationRuleEventAction,
} from '../../_types/automation';
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

    const buildCache = (rules: IAutomationRule[]) => {
        const cachesService: Mockify<ICachesService> = {
            memoize: vi.fn().mockImplementation(({func}) => func()),
        };

        const ruleRepo: Mockify<IAutomationRuleRepo> = {
            getAutomationRules: global.__mockPromise({list: rules, totalCount: rules.length}),
        };

        return automationRulesCache({
            'core.infra.cache.cacheService': cachesService as ICachesService,
            'core.infra.automation.rule': ruleRepo as IAutomationRuleRepo,
        });
    };

    describe('getRulesToTrigger', () => {
        it('matches when rule has no eventTopic and action+sync align', async () => {
            const rule = buildRule({
                trigger: {synchronous: false, eventAction: EventAction.RECORD_SAVE},
            });
            const cache = buildCache([rule]);

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
            const cache = buildCache([rule]);

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
            const cache = buildCache([rule]);

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
            const cache = buildCache([rule]);

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
            const cache = buildCache([rule]);

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
                } as AutomationRulesEventTopic & IAutomationRule['trigger'],
            });
            const cache = buildCache([rule]);

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
            const cache = buildCache([rule]);

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
            const cache = buildCache([rule]);

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
            const cache = buildCache([rule]);

            const matched = await cache.getRulesToTrigger({action: EventAction.RECORD_SAVE}, false, mockCtx);

            expect(matched).toEqual([]);
        });
    });
});
