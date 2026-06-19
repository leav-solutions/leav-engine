import {z} from 'zod';
import {EventAction} from '@leav/utils';
import {AutomationTriggerDefSynchronicity} from './_types';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';
import createAutomationTriggersRegistry from './automationTriggersRegistry';
import {type IAutomationTriggersTopics} from './automationTriggersTopics';

const mockTopics: IAutomationTriggersTopics = {
    librarySchema: z.string(),
    attributeSchema: z.string(),
    libraryAndOptAttributeSchema: z.object({library: z.string(), attribute: z.string()}).strict(),
};

const createRegistry = () =>
    createAutomationTriggersRegistry({
        'core.domain.automation.triggers.topics': mockTopics,
    });

describe('automationTriggersRegistry', () => {
    describe('listTriggers', () => {
        it('should return triggers with the correct properties', () => {
            const registry = createRegistry();
            const triggers = registry.listTriggers();

            expect(triggers.length).toBeGreaterThan(0);
            for (const trigger of triggers) {
                expect(trigger).toHaveProperty('eventAction');
                expect(trigger).toHaveProperty('topicSchema');
                expect(trigger).toHaveProperty('synchronicity');
            }
        });
    });

    describe('getTrigger', () => {
        it('returns the trigger for a known event action', () => {
            const registry = createRegistry();
            const trigger = registry.getTrigger(EventAction.RECORD_INIT);

            expect(trigger.eventAction).toBe(EventAction.RECORD_INIT);
        });

        it('throws a ValidationError for an unknown event action', () => {
            const registry = createRegistry();

            expect(() => registry.getTrigger('UNKNOWN_ACTION' as EventAction)).toThrow(ValidationError);
        });

        it('error carries the AUTOMATION_UNKNOWN_TRIGGER_EVENT_ACTION code', () => {
            const registry = createRegistry();

            expect(() => registry.getTrigger('UNKNOWN_ACTION' as EventAction)).toThrow(
                expect.objectContaining({
                    fields: {
                        eventAction: expect.objectContaining({msg: Errors.AUTOMATION_UNKNOWN_TRIGGER_EVENT_ACTION}),
                    },
                }),
            );
        });
    });

    describe('registerTrigger', () => {
        it('newly registered trigger appears in listTriggers', () => {
            const registry = createRegistry();
            const PLUGIN_ACTION = 'PLUGIN_ACTION' as EventAction;

            registry.registerTrigger({
                eventAction: PLUGIN_ACTION,
                topicSchema: z.object({library: z.string()}).strict(),
                synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
            });

            const actions = registry.listTriggers().map(t => t.eventAction);
            expect(actions).toContain(PLUGIN_ACTION);
        });

        it('newly registered trigger is retrievable via getTrigger', () => {
            const registry = createRegistry();
            const PLUGIN_ACTION = 'PLUGIN_ACTION' as EventAction;

            registry.registerTrigger({
                eventAction: PLUGIN_ACTION,
                topicSchema: z.object({library: z.string()}).strict(),
                synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
            });

            const trigger = registry.getTrigger(PLUGIN_ACTION);
            expect(trigger.eventAction).toBe(PLUGIN_ACTION);
        });

        it('throws when registering the same event action twice', () => {
            const registry = createRegistry();
            const PLUGIN_ACTION = 'PLUGIN_ACTION' as EventAction;

            registry.registerTrigger({
                eventAction: PLUGIN_ACTION,
                topicSchema: z.object({}).strict(),
                synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
            });

            expect(() =>
                registry.registerTrigger({
                    eventAction: PLUGIN_ACTION,
                    topicSchema: z.object({}).strict(),
                    synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
                }),
            ).toThrow();
        });
    });
});
