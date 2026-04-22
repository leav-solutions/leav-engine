// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {z} from 'zod';
import {type EventAction} from '@leav/utils';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IValidateHelper} from '../helpers/validate';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import createAutomationTriggers, {
    AutomationTriggerDefSynchronicity,
    AutomationTriggerDefTopics,
    type IAutomationTriggers,
} from './automationTriggers';

const mockCtx = {userId: 'test-user'} as IQueryInfos;
const mockSystemCtx = {userId: 'system'} as IQueryInfos;

// Test-controlled event actions — independent of built-in triggers
const TEST_ACTION_SYNC = 'TEST_ACTION_SYNC' as EventAction;
const TEST_ACTION_ASYNC = 'TEST_ACTION_ASYNC' as EventAction;
const TEST_ACTION_BOTH = 'TEST_ACTION_BOTH' as EventAction;
const TEST_ACTION_LIB = 'TEST_ACTION_LIB' as EventAction;
const TEST_ACTION_LIB_ATTR = 'TEST_ACTION_LIB_ATTR' as EventAction;

const getSystemQueryContext = vi.fn().mockReturnValue(mockSystemCtx);

const attributeDomain: Mockify<IAttributeDomain> = {
    getAttributeProperties: vi.fn().mockResolvedValue({}),
};

const validate: Mockify<IValidateHelper> = {
    validateLibrary: vi.fn().mockResolvedValue(undefined),
};

describe('automationTriggers', () => {
    let triggers: IAutomationTriggers;

    beforeEach(() => {
        vi.resetAllMocks();
        getSystemQueryContext.mockReturnValue(mockSystemCtx);
        attributeDomain.getAttributeProperties = vi.fn().mockResolvedValue({});
        validate.validateLibrary = vi.fn().mockResolvedValue(undefined);

        triggers = createAutomationTriggers({
            'core.domain.attribute': attributeDomain as unknown as IAttributeDomain,
            'core.domain.helpers.validate': validate as unknown as IValidateHelper,
            'core.utils.getSystemQueryContext': getSystemQueryContext,
        });

        // Register test-controlled triggers so tests don't depend on built-in trigger list
        triggers.registerTrigger({
            eventAction: TEST_ACTION_SYNC,
            topicSchema: z.object({}).strict(),
            synchronicity: AutomationTriggerDefSynchronicity.SYNC,
        });
        triggers.registerTrigger({
            eventAction: TEST_ACTION_ASYNC,
            topicSchema: z.object({}).strict(),
            synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
        });
        triggers.registerTrigger({
            eventAction: TEST_ACTION_BOTH,
            topicSchema: z.object({}).strict(),
            synchronicity: AutomationTriggerDefSynchronicity.BOTH,
        });
        triggers.registerTrigger({
            eventAction: TEST_ACTION_LIB,
            topicSchema: z.object({library: triggers.commonTopicSchemas.library}).strict(),
            synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
        });
        triggers.registerTrigger({
            eventAction: TEST_ACTION_LIB_ATTR,
            topicSchema: z
                .object({
                    library: triggers.commonTopicSchemas.library,
                    attribute: triggers.commonTopicSchemas.attribute,
                })
                .strict(),
            synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
        });
    });

    describe('getAutomationTriggers', () => {
        it('returns at least the registered test triggers', () => {
            const defs = triggers.getAutomationTriggers({ctx: mockCtx});
            expect(defs.length).toBeGreaterThanOrEqual(4);
        });

        it('includes registered triggers in the returned list', () => {
            const defs = triggers.getAutomationTriggers({ctx: mockCtx});
            expect(defs.some(d => d.eventAction === TEST_ACTION_SYNC)).toBe(true);
        });

        it('derives topics from the Zod schema — library-only schema → [LIBRARY]', () => {
            const def = triggers.getAutomationTriggers({ctx: mockCtx}).find(d => d.eventAction === TEST_ACTION_LIB)!;
            expect(def.topics).toEqual([AutomationTriggerDefTopics.LIBRARY]);
        });

        it('derives topics from the Zod schema — library+attribute schema → [LIBRARY, ATTRIBUTE]', () => {
            const def = triggers
                .getAutomationTriggers({ctx: mockCtx})
                .find(d => d.eventAction === TEST_ACTION_LIB_ATTR)!;
            expect(def.topics).toEqual(
                expect.arrayContaining([AutomationTriggerDefTopics.LIBRARY, AutomationTriggerDefTopics.ATTRIBUTE]),
            );
        });
    });

    describe('validateAutomationRuleTrigger', () => {
        describe('unknown event action', () => {
            it('throws ValidationError for an event action with no registered trigger', async () => {
                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {
                            eventAction: 'UNKNOWN_ACTION' as EventAction,
                            eventTopic: {library: 'my_lib'},
                            synchronous: false,
                        },
                        mockCtx,
                    ),
                ).rejects.toBeInstanceOf(ValidationError);
            });

            it('reports AUTOMATION_UNKNOWN_TRIGGER_EVENT_ACTION error code', async () => {
                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {
                            eventAction: 'UNKNOWN_ACTION' as EventAction,
                            eventTopic: {library: 'my_lib'},
                            synchronous: false,
                        },
                        mockCtx,
                    ),
                ).rejects.toMatchObject({
                    fields: {
                        eventAction: expect.objectContaining({msg: Errors.AUTOMATION_UNKNOWN_TRIGGER_EVENT_ACTION}),
                    },
                });
            });
        });

        describe('synchronicity mismatch', () => {
            it('throws ValidationError when SYNC-only trigger is called asynchronously', async () => {
                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_SYNC, eventTopic: {}, synchronous: false},
                        mockCtx,
                    ),
                ).rejects.toMatchObject({
                    fields: {
                        eventAction: expect.objectContaining({msg: Errors.AUTOMATION_INVALID_TRIGGER_ONLY_SYNC}),
                    },
                });
            });

            it('throws ValidationError when ASYNC-only trigger is called synchronously', async () => {
                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_ASYNC, eventTopic: {}, synchronous: true},
                        mockCtx,
                    ),
                ).rejects.toMatchObject({
                    fields: {
                        eventAction: expect.objectContaining({msg: Errors.AUTOMATION_INVALID_TRIGGER_ONLY_ASYNC}),
                    },
                });
            });

            it('accepts BOTH-synchronicity trigger called synchronously', async () => {
                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_BOTH, eventTopic: {}, synchronous: true},
                        mockCtx,
                    ),
                ).resolves.toBeUndefined();
            });

            it('accepts BOTH-synchronicity trigger called asynchronously', async () => {
                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_BOTH, eventTopic: {}, synchronous: false},
                        mockCtx,
                    ),
                ).resolves.toBeUndefined();
            });
        });

        describe('topic validation', () => {
            it('resolves when topic matches the schema', async () => {
                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_LIB, eventTopic: {library: 'my_lib'}, synchronous: false},
                        mockCtx,
                    ),
                ).resolves.toBeUndefined();
            });

            it('throws ValidationError when required library topic is missing', async () => {
                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_LIB, eventTopic: {} as any, synchronous: false},
                        mockCtx,
                    ),
                ).rejects.toMatchObject({
                    fields: {library: expect.objectContaining({msg: Errors.AUTOMATION_INVALID_TRIGGER_EVENT_TOPIC})},
                });
            });

            it('throws ValidationError when library does not exist', async () => {
                validate.validateLibrary = vi.fn().mockRejectedValue(new Error('not found'));

                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_LIB, eventTopic: {library: 'unknown_lib'}, synchronous: false},
                        mockCtx,
                    ),
                ).rejects.toBeInstanceOf(ValidationError);
            });

            it('throws ValidationError when topic has unexpected properties (strict schema)', async () => {
                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {
                            eventAction: TEST_ACTION_LIB,
                            eventTopic: {library: 'my_lib', attribute: 'extra'} as any,
                            synchronous: false,
                        },
                        mockCtx,
                    ),
                ).rejects.toBeInstanceOf(ValidationError);
            });

            it('resolves for multi-topic trigger with all required properties present', async () => {
                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {
                            eventAction: TEST_ACTION_LIB_ATTR,
                            eventTopic: {library: 'my_lib', attribute: 'my_attr'},
                            synchronous: false,
                        },
                        mockCtx,
                    ),
                ).resolves.toBeUndefined();
            });

            it('throws ValidationError for multi-topic trigger when attribute is missing', async () => {
                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_LIB_ATTR, eventTopic: {library: 'my_lib'}, synchronous: false},
                        mockCtx,
                    ),
                ).rejects.toMatchObject({
                    fields: {attribute: expect.objectContaining({msg: Errors.AUTOMATION_INVALID_TRIGGER_EVENT_TOPIC})},
                });
            });

            it('throws ValidationError when attribute does not exist', async () => {
                attributeDomain.getAttributeProperties = vi.fn().mockRejectedValue(new Error('not found'));

                await expect(
                    triggers.validateAutomationRuleTrigger(
                        {
                            eventAction: TEST_ACTION_LIB_ATTR,
                            eventTopic: {library: 'my_lib', attribute: 'unknown_attr'},
                            synchronous: false,
                        },
                        mockCtx,
                    ),
                ).rejects.toBeInstanceOf(ValidationError);
            });
        });
    });

    describe('registerTrigger', () => {
        it('throws when registering a trigger for an already-registered event action', () => {
            expect(() =>
                triggers.registerTrigger({
                    eventAction: TEST_ACTION_SYNC,
                    topicSchema: z.object({library: z.string()}).strict(),
                    synchronicity: AutomationTriggerDefSynchronicity.SYNC,
                }),
            ).toThrow();
        });

        it('registered trigger is validated by validateAutomationRuleTrigger', async () => {
            const PLUGIN_TEST_ACTION = 'PLUGIN_TEST_ACTION' as EventAction;
            triggers.registerTrigger({
                eventAction: PLUGIN_TEST_ACTION,
                topicSchema: z.object({library: z.string()}).strict(),
                synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
            });

            await expect(
                triggers.validateAutomationRuleTrigger(
                    {eventAction: PLUGIN_TEST_ACTION, eventTopic: {library: 'my_lib'}, synchronous: false},
                    mockCtx,
                ),
            ).resolves.toBeUndefined();
        });

        it('topics of a runtime-registered trigger are derived from its schema', () => {
            const PLUGIN_TEST_ACTION = 'PLUGIN_TEST_ACTION' as EventAction;
            triggers.registerTrigger({
                eventAction: PLUGIN_TEST_ACTION,
                topicSchema: z.object({library: z.string(), attribute: z.string()}).strict(),
                synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
            });

            const def = triggers.getAutomationTriggers({ctx: mockCtx}).find(d => d.eventAction === PLUGIN_TEST_ACTION)!;
            expect(def.topics).toEqual(
                expect.arrayContaining([AutomationTriggerDefTopics.LIBRARY, AutomationTriggerDefTopics.ATTRIBUTE]),
            );
        });
    });
});
