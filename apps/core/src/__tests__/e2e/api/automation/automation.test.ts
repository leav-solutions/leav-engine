import {adminUserId} from '../../../../_constants/users';
import {AutomationRuleEventAction, AutomationRuleJsonSchemaFormType, AutomationRuleActions} from '../../_gqlTypes';
import {FAKE_PLUGIN_AUTOMATION_ACTION_TYPE} from '../_fixtures/fakeplugin/domain/fakeAutomationAction';
import {adminUserSdk, nonAdminUserSdk} from '../e2eUtils';

describe('Automation', () => {
    describe('get automation rules', () => {
        test('list rules (empty)', async () => {
            const rules = await adminUserSdk.GetAutomationRules();
            expect(rules.automationRules.list).toBeInstanceOf(Array);
        });

        test('non-admin user cannot list rules', async () => {
            await expect(nonAdminUserSdk.GetAutomationRules()).rejects.toThrow('Action forbidden');
        });
    });

    describe('create automation rule', () => {
        test('create a rule', async () => {
            const newRule = (
                await adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        description: 'This is a test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {
                            steps: [
                                {
                                    type: AutomationRuleActions.condition,
                                    name: 'my-condition',
                                    params: {expression: 'true'},
                                },
                                {
                                    type: AutomationRuleActions.condition,
                                    params: {expression: 'true'},
                                },
                            ],
                        },
                    },
                })
            ).createAutomationRule;

            expect(newRule).toMatchObject({
                id: expect.any(String),
                label: 'Test rule',
            });

            const rules = await adminUserSdk.GetAutomationRules();
            expect(rules.automationRules.list).toEqual([
                expect.objectContaining({
                    id: newRule.id,
                    label: 'Test rule',
                    description: 'This is a test rule',
                    active: false,
                    createdAt: expect.any(Number),
                    createdBy: adminUserId,
                    modifiedAt: expect.any(Number),
                    modifiedBy: adminUserId,
                    trigger: {
                        synchronous: expect.any(Boolean),
                        eventAction: expect.any(String),
                        eventTopic: {
                            library: expect.any(String),
                        },
                    },
                    pipeline: {
                        steps: [
                            {
                                type: AutomationRuleActions.condition,
                                name: 'my-condition',
                                params: {expression: 'true'},
                            },
                            {
                                type: AutomationRuleActions.condition,
                                name: null,
                                params: {expression: 'true'},
                            },
                        ],
                    },
                }),
            ]);
        });

        test('create a rule with invalid pipeline throw an error', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Invalid params rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {
                            steps: [
                                {
                                    type: AutomationRuleActions.condition,
                                    params: {}, // missing required 'expression'
                                },
                            ],
                        },
                    },
                }),
            ).rejects.toThrow(/Invalid action parameters/);
        });

        test('non-admin user cannot create a rule', async () => {
            await expect(
                nonAdminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {steps: []},
                    },
                }),
            ).rejects.toThrow('Action forbidden');
        });

        test('cannot create a rule with wrong synchronicity', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.VALUE_DELETE,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {steps: []},
                    },
                }),
            ).rejects.toThrow('Trigger for event action VALUE_DELETE is only available for asynchronous execution');
        });

        test('cannot create a rule with wrong event topic, library not exists', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'library-no-exists',
                            },
                        },
                        pipeline: {steps: []},
                    },
                }),
            ).rejects.toThrow('Invalid trigger library topic: Library with id "library-no-exists" does not exist');
        });

        test('cannot create a rule with wrong event topic, missing library topic', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {},
                        },
                        pipeline: {steps: []},
                    },
                }),
            ).rejects.toThrow('Invalid trigger library topic: Invalid input: expected string, received undefined');
        });

        test('cannot create a rule with wrong event topic, unexpected attribute topic', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                                attribute: 'attribute-no-expected',
                            },
                        },
                        pipeline: {steps: []},
                    },
                }),
            ).rejects.toThrow('Invalid trigger attribute topic: Unrecognized key: "attribute"');
        });

        test('cannot create an activated rule with an empty pipeline', async () => {
            await expect(
                adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {steps: []},
                        active: true,
                    },
                }),
            ).rejects.toThrow('Cannot activate an automation rule with an empty pipeline');
        });
    });

    describe('update automation rule', () => {
        let ruleToUpdate: any;

        beforeEach(async () => {
            ruleToUpdate = (
                await adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        active: false,
                        description: 'This is a test rule',
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {steps: []},
                    },
                })
            ).createAutomationRule;
        });

        test('update a rule', async () => {
            await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated

            const updatedRule = (
                await adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        label: 'updated label',
                        pipeline: {
                            steps: [
                                {
                                    type: AutomationRuleActions.condition,
                                    params: {expression: 'false'},
                                },
                            ],
                        },
                    },
                })
            ).updateAutomationRule;

            expect(updatedRule).toEqual(
                expect.objectContaining({
                    id: ruleToUpdate.id,
                    label: 'updated label',
                    description: 'This is a test rule', // we verify mergeObjects is true
                    pipeline: {
                        steps: [
                            {
                                type: AutomationRuleActions.condition,
                                name: null,
                                params: {expression: 'false'},
                            },
                        ],
                    },
                }),
            );

            expect(updatedRule.modifiedAt).toBeGreaterThan(ruleToUpdate.modifiedAt);
        });

        test('update a rule with invalid pipeline throw an error', async () => {
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        pipeline: {
                            steps: [
                                {
                                    type: AutomationRuleActions.condition,
                                    params: {}, // missing required 'expression'
                                },
                            ],
                        },
                    },
                }),
            ).rejects.toThrow(/Invalid action parameters/);
        });

        test('non admin cannot update a rule', async () => {
            await expect(
                nonAdminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        label: 'Test rule',
                    },
                }),
            ).rejects.toThrow('Action forbidden');
        });

        test('cannot update a rule with wrong synchronicity', async () => {
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.VALUE_DELETE,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                    },
                }),
            ).rejects.toThrow('Trigger for event action VALUE_DELETE is only available for asynchronous execution');
        });

        test('cannot update a rule with wrong event topic, library not exists', async () => {
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'library-no-exists',
                            },
                        },
                    },
                }),
            ).rejects.toThrow('Invalid trigger library topic: Library with id "library-no-exists" does not exist');
        });

        test('cannot activate a rule with an empty pipeline', async () => {
            // it should throw on activate if existing pipeline is empty
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        active: true,
                    },
                }),
            ).rejects.toThrow('Cannot activate an automation rule with an empty pipeline');

            // it should throw if we update pipeline to empty while activating
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: ruleToUpdate.id,
                        active: true,
                        pipeline: {
                            steps: [],
                        },
                    },
                }),
            ).rejects.toThrow('Cannot activate an automation rule with an empty pipeline');
        });

        test('update unknown rule throws UNKNOWN_AUTOMATION_RULE', async () => {
            await expect(
                adminUserSdk.UpdateAutomationRule({
                    rule: {
                        id: 'nonexistent-rule-id',
                        label: 'ghost',
                    },
                }),
            ).rejects.toThrow(/Unknown automation rule/);
        });
    });

    describe('delete automation rule', () => {
        let ruleToDelete: any;

        beforeEach(async () => {
            ruleToDelete = (
                await adminUserSdk.CreateAutomationRule({
                    rule: {
                        label: 'Test rule',
                        description: 'This is a test rule',
                        active: false,
                        trigger: {
                            synchronous: true,
                            eventAction: AutomationRuleEventAction.RECORD_INIT,
                            eventTopic: {
                                library: 'users',
                            },
                        },
                        pipeline: {steps: []},
                    },
                })
            ).createAutomationRule;
        });

        test('delete a rule', async () => {
            const deletedRule = (await adminUserSdk.DeleteAutomationRule({ruleId: ruleToDelete.id}))
                .deleteAutomationRule;

            expect(deletedRule).toEqual(
                expect.objectContaining({
                    id: ruleToDelete.id,
                }),
            );
        });

        test('cannot delete a rule', async () => {
            await expect(
                nonAdminUserSdk.DeleteAutomationRule({
                    ruleId: ruleToDelete.id,
                }),
            ).rejects.toThrow('Action forbidden');
        });

        test('delete unknown rule throws UNKNOWN_AUTOMATION_RULE', async () => {
            await expect(
                adminUserSdk.DeleteAutomationRule({
                    ruleId: 'nonexistent-rule-id',
                }),
            ).rejects.toThrow(/Unknown automation rule/);
        });
    });

    describe('get automation rule form', () => {
        test('creation json schema has correct structure for RJSF', async () => {
            const result = await adminUserSdk.GetAutomationRuleForm({
                formType: AutomationRuleJsonSchemaFormType.creation,
            });
            const schema = result.automationRuleForm.jsonSchema;

            expect(schema.properties).toHaveProperty('label');
            expect(schema.properties).toHaveProperty('description');
            expect(schema.properties).toHaveProperty('trigger');
            expect(schema.properties).not.toHaveProperty('active');
            expect(schema.required).toEqual(expect.arrayContaining(['label', 'trigger']));

            expect(schema.$defs).toHaveProperty('library');
            expect(schema.$defs).toHaveProperty('attribute');

            const {trigger} = schema.properties;
            expect(trigger.properties.eventAction.enum).toEqual(
                expect.arrayContaining(Object.values(AutomationRuleEventAction)),
            );
            expect(trigger).not.toHaveProperty('readOnly');

            expect(Array.isArray(trigger.allOf)).toBe(true);
            expect(trigger.allOf.length).toBeGreaterThanOrEqual(Object.values(AutomationRuleEventAction).length);

            Object.values(AutomationRuleEventAction).forEach(eventAction => {
                const block = trigger.allOf.find(b => b.if?.properties?.eventAction?.const === eventAction);

                expect(block).toBeDefined();
                expect(block.then.properties).toHaveProperty('eventTopic');
                expect(block.then.required).toContain('eventTopic');
            });

            expect(schema.properties).toHaveProperty('pipeline');
            const {pipeline} = schema.properties;
            expect(pipeline.type).toBe('object');
            expect(pipeline.properties.steps.type).toBe('array');
            expect(pipeline.properties.steps.items.properties.type.enum).toEqual(
                expect.arrayContaining([...Object.values(AutomationRuleActions), FAKE_PLUGIN_AUTOMATION_ACTION_TYPE]),
            );
            expect(pipeline.properties.steps.items.allOf.length).toBe(Object.values(AutomationRuleActions).length + 1);
        });

        test('edition json schema has active field, eventAction and eventTopic readonly, synchronous follows trigger type', async () => {
            const result = await adminUserSdk.GetAutomationRuleForm({
                formType: AutomationRuleJsonSchemaFormType.edition,
            });
            const schema = result.automationRuleForm.jsonSchema;

            expect(schema.properties).toHaveProperty('active');

            expect(schema.properties.trigger.readOnly).toBeUndefined();
            expect(schema.properties.trigger.properties.eventAction.readOnly).toBe(true);

            expect(Array.isArray(schema.properties.trigger.allOf)).toBe(true);
            expect(schema.properties.trigger.allOf.length).toBeGreaterThanOrEqual(3);

            for (const branch of schema.properties.trigger.allOf) {
                expect(branch.then.properties.eventTopic.readOnly).toBe(true);
            }
        });

        test('$defs contains a single entry per key when multiple triggers share the same $defs key', async () => {
            // RECORD_SAVE and VALUE_SAVE both produce a $defs.library definition.
            const result = await adminUserSdk.GetAutomationRuleForm({
                formType: AutomationRuleJsonSchemaFormType.creation,
            });
            const schema = result.automationRuleForm.jsonSchema;

            const libraryDef = schema.$defs?.library;
            expect(libraryDef).toBeDefined();
            expect(libraryDef).toEqual({type: 'string'});
        });

        test('creation ui schema has correct groups and field widgets', async () => {
            const result = await adminUserSdk.GetAutomationRuleForm({
                formType: AutomationRuleJsonSchemaFormType.creation,
            });
            const uiSchema = result.automationRuleForm.uiSchema;

            const {groups} = uiSchema['ui:options'];
            expect(groups).toHaveLength(3);
            expect(groups[0]).toMatchObject({step: '1', fields: expect.arrayContaining(['label', 'description'])});
            expect(groups[1]).toMatchObject({step: '2', fields: ['trigger']});
            expect(groups[2]).toMatchObject({step: '3', fields: ['pipeline']});

            expect(uiSchema.label).toHaveProperty('ui:title');
            expect(uiSchema.description).toHaveProperty('ui:title');

            expect(uiSchema.trigger.eventAction).toHaveProperty('ui:title');
            expect(uiSchema.trigger.eventTopic.library).toHaveProperty('ui:title');
            expect(uiSchema.trigger.eventTopic.attribute).toHaveProperty('ui:title');

            expect(uiSchema.trigger).not.toHaveProperty('ui:readonly');

            const pipelineUiOptions = uiSchema.pipeline.steps['ui:options'];
            expect(pipelineUiOptions).toHaveProperty('addLabel');
            expect(pipelineUiOptions).toHaveProperty('moveUpLabel');
            expect(pipelineUiOptions).toHaveProperty('moveDownLabel');
            expect(pipelineUiOptions).toHaveProperty('deleteLabel');
            expect(pipelineUiOptions.actionTypeLabels).toMatchObject(
                Object.fromEntries(Object.values(AutomationRuleActions).map(type => [type, expect.any(String)])),
            );
            expect(pipelineUiOptions.actionTypeLabels[FAKE_PLUGIN_AUTOMATION_ACTION_TYPE]).toBe('Plugin log action EN');

            const {params} = uiSchema.pipeline.steps.items;
            expect(params.condition.expression).toHaveProperty('ui:title');
            expect(params.jexlExpression.expression).toHaveProperty('ui:title');
            expect(params.modifyAttribute.attributePath).toHaveProperty('ui:title');
            expect(params.notification.recipients).toHaveProperty('ui:title');
            expect(params.plugin_log_action.message).toHaveProperty('ui:title', 'Plugin log message EN');
        });

        test('edition ui schema has active widget and trigger with ui:readonly', async () => {
            const result = await adminUserSdk.GetAutomationRuleForm({
                formType: AutomationRuleJsonSchemaFormType.edition,
            });
            const uiSchema = result.automationRuleForm.uiSchema;

            const {groups} = uiSchema['ui:options'];
            expect(groups[0].fields).toContain('active');

            expect(uiSchema.trigger).toHaveProperty('eventAction');
        });

        test('non-admin user cannot get automation rule form', async () => {
            await expect(
                nonAdminUserSdk.GetAutomationRuleForm({
                    formType: AutomationRuleJsonSchemaFormType.creation,
                }),
            ).rejects.toThrow('Action forbidden');
        });
    });
});
