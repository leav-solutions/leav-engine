// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {z} from 'zod';
import {type EventAction} from '@leav/utils';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {AutomationTriggerDefSynchronicity, AutomationTriggerDefTopics} from './_types';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';
import createAutomationTriggers from './automationTriggers';
import {type IAutomationTriggersRegistry} from './automationTriggersRegistry';

const mockCtx = {userId: 'test-user'} as IQueryInfos;

const TEST_ACTION_SYNC = 'TEST_ACTION_SYNC' as EventAction;
const TEST_ACTION_ASYNC = 'TEST_ACTION_ASYNC' as EventAction;
const TEST_ACTION_BOTH = 'TEST_ACTION_BOTH' as EventAction;
const TEST_ACTION_LIB = 'TEST_ACTION_LIB' as EventAction;
const TEST_ACTION_LIB_ATTR = 'TEST_ACTION_LIB_ATTR' as EventAction;

// Simulates async domain validation (existence checks) without real infra dependencies
const librarySchema = z.string().refine(async val => val !== 'unknown_lib', 'Library does not exist');
const attributeSchema = z.string().refine(async val => val !== 'unknown_attr', 'Attribute does not exist');

const testTriggers = [
    {
        eventAction: TEST_ACTION_SYNC,
        topicSchema: z.object({}).strict(),
        synchronicity: AutomationTriggerDefSynchronicity.SYNC,
    },
    {
        eventAction: TEST_ACTION_ASYNC,
        topicSchema: z.object({}).strict(),
        synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
    },
    {
        eventAction: TEST_ACTION_BOTH,
        topicSchema: z.object({}).strict(),
        synchronicity: AutomationTriggerDefSynchronicity.BOTH,
    },
    {
        eventAction: TEST_ACTION_LIB,
        topicSchema: z.object({library: librarySchema}).strict(),
        synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
    },
    {
        eventAction: TEST_ACTION_LIB_ATTR,
        topicSchema: z.object({library: librarySchema, attribute: attributeSchema}).strict(),
        synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
    },
];

const triggersRegistry: Mockify<IAutomationTriggersRegistry> = {
    listTriggers: vi.fn(),
    getTrigger: vi.fn(),
    registerTrigger: vi.fn(),
};

const createTriggers = () =>
    createAutomationTriggers({
        'core.domain.automation.triggers.registry': triggersRegistry as unknown as IAutomationTriggersRegistry,
    });

describe('automationTriggers', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        triggersRegistry.listTriggers = vi.fn().mockReturnValue(testTriggers);
        triggersRegistry.getTrigger = vi.fn().mockImplementation((eventAction: EventAction) => {
            const trigger = testTriggers.find(t => t.eventAction === eventAction);
            if (!trigger) {
                throw new ValidationError(
                    {eventAction: {msg: Errors.AUTOMATION_UNKNOWN_TRIGGER_EVENT_ACTION, vars: {action: eventAction}}},
                    `No trigger found for event action ${eventAction}`,
                );
            }
            return trigger;
        });
    });

    describe('getAutomationTriggersDef', () => {
        it('returns one def per registered trigger', () => {
            const defs = createTriggers().listAutomationTriggersDef({ctx: mockCtx});

            expect(defs).toHaveLength(testTriggers.length);
        });

        it('preserves eventAction and synchronicity from the registry', () => {
            const defs = createTriggers().listAutomationTriggersDef({ctx: mockCtx});
            const def = defs.find(d => d.eventAction === TEST_ACTION_SYNC)!;

            expect(def.eventAction).toBe(TEST_ACTION_SYNC);
            expect(def.synchronicity).toBe(AutomationTriggerDefSynchronicity.SYNC);
        });

        it('derives topics [] from an empty object schema', () => {
            const def = createTriggers()
                .listAutomationTriggersDef({ctx: mockCtx})
                .find(d => d.eventAction === TEST_ACTION_SYNC)!;

            expect(def.topics).toEqual([]);
        });

        it('derives topics [LIBRARY] from a library-only schema', () => {
            const def = createTriggers()
                .listAutomationTriggersDef({ctx: mockCtx})
                .find(d => d.eventAction === TEST_ACTION_LIB)!;

            expect(def.topics).toEqual([AutomationTriggerDefTopics.LIBRARY]);
        });

        it('derives topics [LIBRARY, ATTRIBUTE] from a library+attribute schema', () => {
            const def = createTriggers()
                .listAutomationTriggersDef({ctx: mockCtx})
                .find(d => d.eventAction === TEST_ACTION_LIB_ATTR)!;

            expect(def.topics).toEqual(
                expect.arrayContaining([AutomationTriggerDefTopics.LIBRARY, AutomationTriggerDefTopics.ATTRIBUTE]),
            );
        });
    });

    describe('validateAutomationRuleTrigger', () => {
        describe('unknown event action', () => {
            it('throws ValidationError when no trigger is registered for the event action', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {eventAction: 'UNKNOWN_ACTION' as EventAction, eventTopic: {}, synchronous: false},
                        mockCtx,
                    ),
                ).rejects.toBeInstanceOf(ValidationError);
            });

            it('error carries the AUTOMATION_UNKNOWN_TRIGGER_EVENT_ACTION code', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {eventAction: 'UNKNOWN_ACTION' as EventAction, eventTopic: {}, synchronous: false},
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
            it('throws ValidationError with AUTOMATION_INVALID_TRIGGER_ONLY_SYNC when SYNC trigger is called asynchronously', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_SYNC, eventTopic: {}, synchronous: false},
                        mockCtx,
                    ),
                ).rejects.toMatchObject({
                    fields: {
                        eventAction: expect.objectContaining({msg: Errors.AUTOMATION_INVALID_TRIGGER_ONLY_SYNC}),
                    },
                });
            });

            it('throws ValidationError with AUTOMATION_INVALID_TRIGGER_ONLY_ASYNC when ASYNC trigger is called synchronously', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_ASYNC, eventTopic: {}, synchronous: true},
                        mockCtx,
                    ),
                ).rejects.toMatchObject({
                    fields: {
                        eventAction: expect.objectContaining({msg: Errors.AUTOMATION_INVALID_TRIGGER_ONLY_ASYNC}),
                    },
                });
            });

            it('resolves when BOTH trigger is called synchronously', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_BOTH, eventTopic: {}, synchronous: true},
                        mockCtx,
                    ),
                ).resolves.toBeUndefined();
            });

            it('resolves when BOTH trigger is called asynchronously', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_BOTH, eventTopic: {}, synchronous: false},
                        mockCtx,
                    ),
                ).resolves.toBeUndefined();
            });
        });

        describe('topic validation', () => {
            it('resolves when the topic matches the schema', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_LIB, eventTopic: {library: 'my_lib'}, synchronous: false},
                        mockCtx,
                    ),
                ).resolves.toBeUndefined();
            });

            it('throws ValidationError with AUTOMATION_INVALID_TRIGGER_EVENT_TOPIC when a required field is missing', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_LIB, eventTopic: {} as any, synchronous: false},
                        mockCtx,
                    ),
                ).rejects.toMatchObject({
                    fields: {library: expect.objectContaining({msg: Errors.AUTOMATION_INVALID_TRIGGER_EVENT_TOPIC})},
                });
            });

            it('throws ValidationError with AUTOMATION_INVALID_TRIGGER_EVENT_TOPIC when a domain check fails', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_LIB, eventTopic: {library: 'unknown_lib'}, synchronous: false},
                        mockCtx,
                    ),
                ).rejects.toMatchObject({
                    fields: {library: expect.objectContaining({msg: Errors.AUTOMATION_INVALID_TRIGGER_EVENT_TOPIC})},
                });
            });

            it('throws ValidationError when topic has unexpected properties (strict schema)', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {
                            eventAction: TEST_ACTION_LIB,
                            eventTopic: {library: 'my_lib', attribute: 'extra'} as any,
                            synchronous: false,
                        },
                        mockCtx,
                    ),
                ).rejects.toBeInstanceOf(ValidationError);
            });

            it('resolves for a multi-topic trigger with all required properties present', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {
                            eventAction: TEST_ACTION_LIB_ATTR,
                            eventTopic: {library: 'my_lib', attribute: 'my_attr'},
                            synchronous: false,
                        },
                        mockCtx,
                    ),
                ).resolves.toBeUndefined();
            });

            it('throws ValidationError with AUTOMATION_INVALID_TRIGGER_EVENT_TOPIC when a required field is missing in a multi-topic trigger', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {eventAction: TEST_ACTION_LIB_ATTR, eventTopic: {library: 'my_lib'}, synchronous: false},
                        mockCtx,
                    ),
                ).rejects.toMatchObject({
                    fields: {attribute: expect.objectContaining({msg: Errors.AUTOMATION_INVALID_TRIGGER_EVENT_TOPIC})},
                });
            });

            it('throws ValidationError when a domain check fails on one of the fields', async () => {
                await expect(
                    createTriggers().validateAutomationRuleTrigger(
                        {
                            eventAction: TEST_ACTION_LIB_ATTR,
                            eventTopic: {library: 'my_lib', attribute: 'unknown_attr'},
                            synchronous: false,
                        },
                        mockCtx,
                    ),
                ).rejects.toMatchObject({
                    fields: {attribute: expect.objectContaining({msg: Errors.AUTOMATION_INVALID_TRIGGER_EVENT_TOPIC})},
                });
            });
        });
    });
});
