import {EventAction} from '@leav/utils';
import {type IAutomationRule} from '../../_types/automation';
import {type IConfig} from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import automationDomain, {type IAutomationDomainDeps} from './automationDomain';
import {type IAutomationRulesCache} from './automationRulesCache';
import {type IAutomationPipelineDomain} from './pipeline/pipeline';
import {type IAutomationTriggers} from './triggers/automationTriggers';

const mockCtx: IQueryInfos = {
    userId: '1',
    queryId: 'automationDomain.spec',
};

describe('automationDomain', () => {
    beforeEach(() => vi.clearAllMocks());

    const buildRule = (overrides: Partial<IAutomationRule> = {}): IAutomationRule =>
        ({
            id: 'rule-id',
            label: 'rule',
            active: true,
            createdAt: 0,
            createdBy: 'system',
            modifiedAt: 0,
            modifiedBy: 'system',
            trigger: {
                synchronous: true,
                eventAction: EventAction.VALUE_SAVE,
                eventTopic: {library: 'products'},
            },
            pipeline: {steps: [], inputDataSchema: {}},
            ...overrides,
        }) as IAutomationRule;

    const buildDomain = ({
        rules = [buildRule()],
        maxChainDepth = 5,
    }: {rules?: IAutomationRule[]; maxChainDepth?: number} = {}) => {
        const automationTriggers: Mockify<IAutomationTriggers> = {
            isEventActionInTriggers: vi.fn().mockReturnValue(true),
        };

        const rulesCache: Mockify<IAutomationRulesCache> = {
            getRulesToTrigger: vi.fn().mockResolvedValue(rules),
        };

        const pipelineDomain: Mockify<IAutomationPipelineDomain> = {
            executePipeline: vi.fn().mockResolvedValue(true),
        };

        const eventsManagerDomain: Mockify<IEventsManagerDomain> = {
            sendDatabaseEvent: vi.fn().mockResolvedValue(undefined),
        };

        const config = {automation: {maxChainDepth}} as IConfig;

        const domain = automationDomain({
            config,
            'core.domain.automation.triggers': automationTriggers,
            'core.domain.eventsManager': eventsManagerDomain,
            'core.domain.automation.pipeline': pipelineDomain,
            'core.domain.automation.rulesCache': rulesCache,
        } as unknown as IAutomationDomainDeps);

        return {domain, automationTriggers, rulesCache, pipelineDomain, eventsManagerDomain};
    };

    const valueSaveEvent = {
        action: EventAction.VALUE_SAVE,
        topic: {library: 'products', attribute: 'price'},
    };

    describe('triggerRules — chain depth guard', () => {
        it('executes pipelines with a copied ctx carrying depth + 1, without mutating the caller ctx', async () => {
            const {domain, pipelineDomain} = buildDomain();

            await domain.triggerRules({event: valueSaveEvent, synchronous: true, ctx: mockCtx});

            expect(pipelineDomain.executePipeline).toHaveBeenCalledTimes(1);
            expect(pipelineDomain.executePipeline).toHaveBeenCalledWith(expect.anything(), {
                ...mockCtx,
                automationDepth: 1,
            });
            expect(mockCtx.automationDepth).toBeUndefined();
        });

        it('increments the incoming depth for the pipelines it spawns', async () => {
            const {domain, pipelineDomain} = buildDomain();

            await domain.triggerRules({
                event: valueSaveEvent,
                synchronous: true,
                ctx: {...mockCtx, automationDepth: 3},
            });

            expect(pipelineDomain.executePipeline).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({automationDepth: 4}),
            );
        });

        it('runs the last allowed rebound at depth = maxChainDepth - 1', async () => {
            const {domain, pipelineDomain, eventsManagerDomain} = buildDomain({maxChainDepth: 5});

            await domain.triggerRules({
                event: valueSaveEvent,
                synchronous: true,
                ctx: {...mockCtx, automationDepth: 4},
            });

            expect(pipelineDomain.executePipeline).toHaveBeenCalledTimes(1);
            expect(eventsManagerDomain.sendDatabaseEvent).not.toHaveBeenCalled();
        });

        it('cuts the chain when the incoming depth reaches maxChainDepth: no rule is executed', async () => {
            const {domain, pipelineDomain, eventsManagerDomain} = buildDomain({maxChainDepth: 5});

            await domain.triggerRules({
                event: valueSaveEvent,
                synchronous: true,
                ctx: {...mockCtx, automationDepth: 5},
            });

            expect(pipelineDomain.executePipeline).not.toHaveBeenCalled();
            expect(eventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledTimes(1);
            expect(eventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledWith(
                {
                    action: EventAction.AUTOMATION_CHAIN_DEPTH_EXCEEDED,
                    topic: valueSaveEvent.topic,
                    metadata: {automationDepth: 5, maxAutomationChainDepth: 5, blockedRules: ['rule-id']},
                },
                expect.objectContaining({automationDepth: 5}),
            );
        });

        it('stays silent when the depth is reached but no rule matches: the chain ends by itself', async () => {
            const {domain, pipelineDomain, eventsManagerDomain} = buildDomain({rules: [], maxChainDepth: 5});

            await domain.triggerRules({
                event: valueSaveEvent,
                synchronous: true,
                ctx: {...mockCtx, automationDepth: 5},
            });

            expect(pipelineDomain.executePipeline).not.toHaveBeenCalled();
            expect(eventsManagerDomain.sendDatabaseEvent).not.toHaveBeenCalled();
        });

        it('cuts the chain on the async path too', async () => {
            const {domain, pipelineDomain, eventsManagerDomain} = buildDomain({
                rules: [buildRule({trigger: {synchronous: false, eventAction: EventAction.VALUE_SAVE}})],
                maxChainDepth: 5,
            });

            await domain.triggerRules({
                event: valueSaveEvent,
                synchronous: false,
                ctx: {...mockCtx, automationDepth: 6},
            });

            expect(pipelineDomain.executePipeline).not.toHaveBeenCalled();
            expect(eventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledTimes(1);
        });

        it('treats a missing depth as 0 and lets user-initiated events through', async () => {
            const {domain, pipelineDomain, eventsManagerDomain} = buildDomain({maxChainDepth: 1});

            await domain.triggerRules({event: valueSaveEvent, synchronous: true, ctx: mockCtx});

            expect(pipelineDomain.executePipeline).toHaveBeenCalledTimes(1);
            expect(eventsManagerDomain.sendDatabaseEvent).not.toHaveBeenCalled();
        });
    });

    describe('duplicateAutomationRule', () => {
        const buildDuplicateDomain = ({
            source = buildRule({active: true}),
            hasPermission = true,
        }: {source?: IAutomationRule | null; hasPermission?: boolean} = {}) => {
            const adminPermissionDomain = {
                getAdminPermission: vi.fn().mockResolvedValue(hasPermission),
            };
            const automationRuleRepo = {
                getAutomationRules: vi.fn().mockResolvedValue({
                    list: source ? [source] : [],
                    totalCount: source ? 1 : 0,
                }),
                createAutomationRule: vi.fn().mockImplementation(async rule => ({...rule, id: 'new-rule-id'})),
            };
            const automationTriggers = {
                validateAutomationRuleTrigger: vi.fn().mockResolvedValue(undefined),
            };
            const pipelineDomain = {
                validatePipeline: vi.fn().mockResolvedValue(undefined),
            };
            const rulesCache = {invalidate: vi.fn().mockResolvedValue(undefined)};
            const eventsManagerDomain = {sendDatabaseEvent: vi.fn().mockResolvedValue(undefined)};

            const domain = automationDomain({
                config: {automation: {maxChainDepth: 5}} as IConfig,
                'core.domain.automation.triggers': automationTriggers,
                'core.domain.permission.admin': adminPermissionDomain,
                'core.domain.eventsManager': eventsManagerDomain,
                'core.domain.automation.pipeline': pipelineDomain,
                'core.domain.automation.rulesCache': rulesCache,
                'core.infra.automation.rule': automationRuleRepo,
            } as unknown as IAutomationDomainDeps);

            return {domain, automationRuleRepo};
        };

        it('creates an inactive copy carrying the source trigger, pipeline, description and version', async () => {
            const source = buildRule({active: true, label: 'My rule', description: 'desc', version: '1.0'});
            const {domain, automationRuleRepo} = buildDuplicateDomain({source});

            const copy = await domain.duplicateAutomationRule({
                ruleId: source.id,
                label: 'Copy of My rule',
                ctx: mockCtx,
            });

            expect(automationRuleRepo.createAutomationRule).toHaveBeenCalledWith(
                {
                    label: 'Copy of My rule',
                    description: 'desc',
                    version: '1.0',
                    trigger: source.trigger,
                    pipeline: source.pipeline,
                    active: false,
                },
                mockCtx,
            );
            expect(copy.id).toBe('new-rule-id');
            expect(copy.active).toBe(false);
        });

        it('stores the caller label as-is, without deriving it from the source', async () => {
            const {domain, automationRuleRepo} = buildDuplicateDomain({source: buildRule({label: 'My rule'})});

            await domain.duplicateAutomationRule({ruleId: 'rule-id', label: 'Something else', ctx: mockCtx});

            expect(automationRuleRepo.createAutomationRule).toHaveBeenCalledWith(
                expect.objectContaining({label: 'Something else'}),
                mockCtx,
            );
        });

        it('throws a validation error when the source rule does not exist', async () => {
            const {domain} = buildDuplicateDomain({source: null});

            await expect(
                domain.duplicateAutomationRule({ruleId: 'unknown', label: 'Copie', ctx: mockCtx}),
            ).rejects.toBeInstanceOf(ValidationError);
        });

        it('throws a permission error when the user cannot manage automation', async () => {
            const {domain} = buildDuplicateDomain({hasPermission: false});

            await expect(
                domain.duplicateAutomationRule({ruleId: 'rule-id', label: 'Copie', ctx: mockCtx}),
            ).rejects.toBeInstanceOf(PermissionError);
        });
    });

    describe('bulk actions', () => {
        const buildBulkDomain = ({hasPermission = true}: {hasPermission?: boolean} = {}) => {
            const adminPermissionDomain = {
                getAdminPermission: vi.fn().mockResolvedValue(hasPermission),
            };
            const automationRuleRepo = {
                // Used by the empty-pipeline guard when a rule is activated without a pipeline of its own
                // (bulk activation only ever sends {id, active}): a non-empty pipeline here keeps that guard
                // out of the way of these tests, which are about the batching, not that validation.
                getAutomationRules: vi.fn().mockResolvedValue({
                    list: [
                        buildRule({
                            pipeline: {
                                steps: [
                                    {
                                        type: '',
                                        params: undefined,
                                    },
                                ],
                            },
                        }),
                    ],
                }),
                updateAutomationRule: vi.fn().mockImplementation(async rule => buildRule(rule)),
                deleteAutomationRule: vi.fn().mockImplementation(async ruleId => buildRule({id: ruleId})),
            };
            const automationTriggers = {
                validateAutomationRuleTrigger: vi.fn().mockResolvedValue(undefined),
            };
            const pipelineDomain = {
                validatePipeline: vi.fn().mockResolvedValue(undefined),
            };
            const rulesCache = {invalidate: vi.fn().mockResolvedValue(undefined)};
            const eventsManagerDomain = {sendDatabaseEvent: vi.fn().mockResolvedValue(undefined)};

            const domain = automationDomain({
                config: {automation: {maxChainDepth: 5}} as IConfig,
                'core.domain.automation.triggers': automationTriggers,
                'core.domain.permission.admin': adminPermissionDomain,
                'core.domain.eventsManager': eventsManagerDomain,
                'core.domain.automation.pipeline': pipelineDomain,
                'core.domain.automation.rulesCache': rulesCache,
                'core.infra.automation.rule': automationRuleRepo,
            } as unknown as IAutomationDomainDeps);

            return {domain, automationRuleRepo, rulesCache, eventsManagerDomain, adminPermissionDomain};
        };

        describe('setAutomationRulesActive', () => {
            it('calls the unitary update once per rule id, with {id, active}', async () => {
                const {domain, automationRuleRepo} = buildBulkDomain();

                await domain.setAutomationRulesActive({ruleIds: ['1', '2', '3'], active: false, ctx: mockCtx});

                expect(automationRuleRepo.updateAutomationRule).toHaveBeenCalledTimes(3);
                expect(automationRuleRepo.updateAutomationRule).toHaveBeenCalledWith({id: '1', active: false}, mockCtx);
                expect(automationRuleRepo.updateAutomationRule).toHaveBeenCalledWith({id: '2', active: false}, mockCtx);
                expect(automationRuleRepo.updateAutomationRule).toHaveBeenCalledWith({id: '3', active: false}, mockCtx);
            });

            // This is the invariant behind D3: going through the unitary method rather than a single bulk
            // AQL is what keeps the rules cache and the events in sync with each write.
            it('invalidates the rules cache and emits an event once per rule', async () => {
                const {domain, rulesCache, eventsManagerDomain} = buildBulkDomain();

                await domain.setAutomationRulesActive({ruleIds: ['1', '2'], active: true, ctx: mockCtx});

                expect(rulesCache.invalidate).toHaveBeenCalledTimes(2);
                expect(eventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledTimes(2);
            });

            it('rejects with a permission error and calls the repo for no rule when the permission is missing', async () => {
                const {domain, automationRuleRepo} = buildBulkDomain({hasPermission: false});

                await expect(
                    domain.setAutomationRulesActive({ruleIds: ['1'], active: true, ctx: mockCtx}),
                ).rejects.toBeInstanceOf(PermissionError);
                expect(automationRuleRepo.updateAutomationRule).not.toHaveBeenCalled();
            });

            it('returns an empty array and writes nothing when no rule id is given', async () => {
                const {domain, automationRuleRepo} = buildBulkDomain();

                const result = await domain.setAutomationRulesActive({ruleIds: [], active: true, ctx: mockCtx});

                expect(result).toEqual([]);
                expect(automationRuleRepo.updateAutomationRule).not.toHaveBeenCalled();
            });

            // A stale id in the admin list (another admin deleted the rule meanwhile) must surface as a
            // validation error, not as an internal error on the missing pipeline of a rule that is not there.
            it('rejects with a validation error when a rule id does not exist', async () => {
                const {domain, automationRuleRepo} = buildBulkDomain();
                automationRuleRepo.getAutomationRules.mockResolvedValue({list: []});

                await expect(
                    domain.setAutomationRulesActive({ruleIds: ['unknown'], active: true, ctx: mockCtx}),
                ).rejects.toBeInstanceOf(ValidationError);
                expect(automationRuleRepo.updateAutomationRule).not.toHaveBeenCalled();
            });
        });

        describe('deleteAutomationRules', () => {
            it('calls the unitary delete once per rule id', async () => {
                const {domain, automationRuleRepo} = buildBulkDomain();

                await domain.deleteAutomationRules({ruleIds: ['1', '2', '3'], ctx: mockCtx});

                expect(automationRuleRepo.deleteAutomationRule).toHaveBeenCalledTimes(3);
                expect(automationRuleRepo.deleteAutomationRule).toHaveBeenCalledWith('1', mockCtx);
                expect(automationRuleRepo.deleteAutomationRule).toHaveBeenCalledWith('2', mockCtx);
                expect(automationRuleRepo.deleteAutomationRule).toHaveBeenCalledWith('3', mockCtx);
            });

            it('invalidates the rules cache and emits an event once per rule', async () => {
                const {domain, rulesCache, eventsManagerDomain} = buildBulkDomain();

                await domain.deleteAutomationRules({ruleIds: ['1', '2'], ctx: mockCtx});

                expect(rulesCache.invalidate).toHaveBeenCalledTimes(2);
                expect(eventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledTimes(2);
            });

            it('rejects with a permission error and calls the repo for no rule when the permission is missing', async () => {
                const {domain, automationRuleRepo} = buildBulkDomain({hasPermission: false});

                await expect(domain.deleteAutomationRules({ruleIds: ['1'], ctx: mockCtx})).rejects.toBeInstanceOf(
                    PermissionError,
                );
                expect(automationRuleRepo.deleteAutomationRule).not.toHaveBeenCalled();
            });

            it('returns an empty array and writes nothing when no rule id is given', async () => {
                const {domain, automationRuleRepo} = buildBulkDomain();

                const result = await domain.deleteAutomationRules({ruleIds: [], ctx: mockCtx});

                expect(result).toEqual([]);
                expect(automationRuleRepo.deleteAutomationRule).not.toHaveBeenCalled();
            });
        });
    });
});
