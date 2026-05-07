// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {adminsGroupId} from '../../../../_constants/users';
import {
    AutomationRuleEventAction,
    AutomationRuleActions,
    type LibraryInput,
    AttributeType,
    AttributeFormat,
    type AutomationRulePipelineStepInput,
} from '../../_gqlTypes';
import {adminUserSdk, e2eAdminUser, e2eGuestUser, e2eNonAdminUser} from '../e2eUtils';
import {type NotificationActionParams} from '../../../../domain/automation/actions/notificationAction';
import {type ConditionActionParams} from '../../../../domain/automation/actions/conditionAction';

describe('Automation RECORD_INIT', () => {
    const testLibraryId = 'automation_record_init_test_library';
    const testLibraryLabelAttrId = 'automation_record_init_test_library_label_attr';
    const testLibraryColorsAttrId = 'automation_record_init_test_library_colors_attr';
    const testLibraryGroupsAttrId = 'automation_record_init_test_library_groups_attr';
    const testLibraryUsersAttrId = 'automation_record_init_test_library_users_attr';
    let recordId: string;

    beforeAll(async () => {
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: testLibraryLabelAttrId,
                label: {en: 'Library label'},
                type: AttributeType.simple,
                format: AttributeFormat.text,
            },
        });
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: testLibraryColorsAttrId,
                label: {en: 'Library colors'},
                type: AttributeType.advanced,
                format: AttributeFormat.color,
                multiple_values: true,
            },
        });
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: testLibraryUsersAttrId,
                label: {en: 'Library users'},
                type: AttributeType.advanced_link,
                linked_library: 'users', // avoid complexe setup for now
                multiple_values: true,
            },
        });
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: testLibraryGroupsAttrId,
                label: {en: 'Library groups'},
                type: AttributeType.tree,
                linked_tree: 'users_groups', // avoid complexe setup for now
                multiple_values: true,
            },
        });

        // Create a library to use for testing
        await adminUserSdk.SaveLibrary({
            library: {
                id: testLibraryId,
                label: {en: 'Automation Record Init Test Library'},
                attributes: [
                    testLibraryLabelAttrId,
                    testLibraryColorsAttrId,
                    testLibraryUsersAttrId,
                    testLibraryGroupsAttrId,
                ],
            } as LibraryInput,
        });
    });

    beforeEach(async () => {
        recordId = await createRecord(testLibraryId);
    });

    async function createRecordInitRule(pipelineSteps: AutomationRulePipelineStepInput[]) {
        const ruleId = (
            await adminUserSdk.CreateAutomationRule({
                rule: {
                    label: 'Set default value on record init',
                    active: true,
                    trigger: {
                        synchronous: true,
                        eventAction: AutomationRuleEventAction.RECORD_INIT,
                        eventTopic: {
                            library: testLibraryId,
                        },
                    },
                    pipeline: {
                        steps: pipelineSteps,
                    },
                },
            })
        ).createAutomationRule.id;
        return ruleId;
    }

    async function updateRecordInitRule(ruleId: string, pipelineSteps: AutomationRulePipelineStepInput[]) {
        await adminUserSdk.UpdateAutomationRule({
            rule: {
                id: ruleId,
                pipeline: {
                    steps: pipelineSteps,
                },
            },
        });
    }

    async function createRecord(libraryId: string) {
        return (
            await adminUserSdk.CreateRecord({
                library: libraryId,
            })
        ).createRecord.record.id;
    }

    describe('pipeline with a notification action', () => {
        let ruleId: string;

        beforeAll(async () => {
            ruleId = await createRecordInitRule([
                {
                    type: AutomationRuleActions.notification,
                    params: {
                        title: 'Record initialized',
                        recipients: `["${e2eAdminUser().userId}"]`,
                        message: '"Record with id " +  currentRecord.id + " has been initialized"',
                        mail: true,
                    } satisfies NotificationActionParams,
                },
            ]);
        });

        afterAll(async () => {
            await adminUserSdk.DeleteAutomationRule({ruleId});
        });

        test('should send notification with currentRecord context', async () => {
            const {notifications} = await adminUserSdk.Notifications();
            const notification = notifications.list.find(n => n.title === 'Record initialized');

            expect(notification).toBeDefined();
            expect(notification.message).toBe(`Record with id ${recordId} has been initialized`);
        });
    });

    describe('setup default value jexl calculation and modify attribute actions', () => {
        describe('simple attribute', () => {
            let ruleId: string;
            beforeAll(async () => {
                ruleId = await createRecordInitRule([
                    {
                        type: AutomationRuleActions.jexlCalculation,
                        params: {
                            formula: '"Default library label"',
                        },
                    },
                    {
                        type: AutomationRuleActions.modifyAttribute,
                        params: {
                            attributePath: testLibraryLabelAttrId,
                            mode: 'replace',
                        },
                    },
                ]);
            });

            afterAll(async () => {
                await adminUserSdk.DeleteAutomationRule({ruleId});
            });

            test('should set value from previous step result', async () => {
                const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                    attributeId: testLibraryLabelAttrId,
                    libraryId: testLibraryId,
                    recordId,
                });

                expect(res.records.list[0].property).toEqual([
                    expect.objectContaining({payload: 'Default library label'}),
                ]);
            });
        });

        describe('advanced multi value', () => {
            let ruleId: string;
            beforeAll(async () => {
                ruleId = await createRecordInitRule([
                    {
                        type: AutomationRuleActions.jexlCalculation,
                        params: {
                            formula: '["#ff0000", "#00ff00", "#0000ff"]',
                        },
                    },
                    {
                        type: AutomationRuleActions.modifyAttribute,
                        params: {
                            attributePath: testLibraryColorsAttrId,
                            mode: 'replace',
                        },
                    },
                ]);
            });

            afterAll(async () => {
                await adminUserSdk.DeleteAutomationRule({ruleId});
            });

            test('should set multiple value from previous step result (jexl calculation)', async () => {
                const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                    attributeId: testLibraryColorsAttrId,
                    libraryId: testLibraryId,
                    recordId,
                });

                expect(res.records.list[0].property).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({payload: '#ff0000'}),
                        expect.objectContaining({payload: '#00ff00'}),
                        expect.objectContaining({payload: '#0000ff'}),
                    ]),
                );
            });

            describe('when replacing the default value with other actions', () => {
                beforeAll(async () => {
                    await updateRecordInitRule(ruleId, [
                        {
                            type: AutomationRuleActions.jexlCalculation,
                            params: {
                                formula: '["#ff0000", "#00ff00", "#0000ff"]',
                            },
                        },
                        {
                            type: AutomationRuleActions.modifyAttribute,
                            params: {
                                attributePath: testLibraryColorsAttrId,
                                mode: 'replace',
                            },
                        },
                        {
                            type: AutomationRuleActions.jexlCalculation,
                            params: {
                                formula: '["#ff00dd", "#0000ff"]',
                            },
                        },
                        {
                            type: AutomationRuleActions.modifyAttribute,
                            params: {
                                attributePath: testLibraryColorsAttrId,
                                mode: 'replace',
                            },
                        },
                    ]);
                });

                test('should remove previous values when replacing with new ones', async () => {
                    const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                        attributeId: testLibraryColorsAttrId,
                        libraryId: testLibraryId,
                        recordId,
                    });

                    expect(res.records.list[0].property).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({payload: '#ff00dd'}),
                            expect.objectContaining({payload: '#0000ff'}),
                        ]),
                    );
                });
            });

            describe('when adding the default value with other actions', () => {
                beforeAll(async () => {
                    await updateRecordInitRule(ruleId, [
                        {
                            type: AutomationRuleActions.jexlCalculation,
                            params: {
                                formula: '["#ff0000", "#00ff00", "#0000ff"]',
                            },
                        },
                        {
                            type: AutomationRuleActions.modifyAttribute,
                            params: {
                                attributePath: testLibraryColorsAttrId,
                                mode: 'replace',
                            },
                        },
                        {
                            type: AutomationRuleActions.jexlCalculation,
                            params: {
                                formula: '["#ff00dd", "#0000ff"]',
                            },
                        },
                        {
                            type: AutomationRuleActions.modifyAttribute,
                            params: {
                                attributePath: testLibraryColorsAttrId,
                                mode: 'add',
                            },
                        },
                    ]);
                });

                test('should add new values to the existing ones', async () => {
                    const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                        attributeId: testLibraryColorsAttrId,
                        libraryId: testLibraryId,
                        recordId,
                    });

                    expect(res.records.list[0].property).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({payload: '#ff0000'}),
                            expect.objectContaining({payload: '#00ff00'}),
                            expect.objectContaining({payload: '#0000ff'}),
                            expect.objectContaining({payload: '#ff00dd'}),
                        ]),
                    );
                });
            });
        });

        describe('link attribute', () => {
            let ruleId: string;
            beforeAll(async () => {
                ruleId = await createRecordInitRule([
                    {
                        type: AutomationRuleActions.jexlCalculation,
                        params: {
                            formula: `[{ id: "${e2eGuestUser().userId}" }, { id: "${e2eNonAdminUser().userId}" }]`,
                        },
                    },
                    {
                        type: AutomationRuleActions.modifyAttribute,
                        params: {
                            attributePath: testLibraryUsersAttrId,
                            mode: 'add',
                        },
                    },
                ]);
            });

            afterAll(async () => {
                await adminUserSdk.DeleteAutomationRule({ruleId});
            });

            test('should set value from previous step result (jexl calculation)', async () => {
                const res = await adminUserSdk.GetRecordByIdLinkValuesProperty({
                    attributeId: testLibraryUsersAttrId,
                    libraryId: testLibraryId,
                    recordId,
                });

                expect(res.records.list[0].property).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({payload: expect.objectContaining({id: e2eGuestUser().userId})}),
                        expect.objectContaining({payload: expect.objectContaining({id: e2eNonAdminUser().userId})}),
                    ]),
                );
            });
        });

        describe('tree attribute', () => {
            let ruleId: string;
            beforeAll(async () => {
                ruleId = await createRecordInitRule([
                    {
                        type: AutomationRuleActions.jexlCalculation,
                        params: {
                            formula: `[{ id: "${adminsGroupId}" }]`,
                        },
                    },
                    {
                        type: AutomationRuleActions.modifyAttribute,
                        params: {
                            attributePath: testLibraryGroupsAttrId,
                            mode: 'replace',
                        },
                    },
                ]);
            });

            afterAll(async () => {
                await adminUserSdk.DeleteAutomationRule({ruleId});
            });

            test('should set value from previous step result (jexl calculation)', async () => {
                const res = await adminUserSdk.GetRecordByIdTreeValuesProperty({
                    attributeId: testLibraryGroupsAttrId,
                    libraryId: testLibraryId,
                    recordId,
                });

                expect(res.records.list[0].property).toEqual([
                    expect.objectContaining({payload: expect.objectContaining({id: adminsGroupId})}),
                ]);
            });
        });
    });

    describe('pipeline with a condition action', () => {
        describe('when condition is true, pipeline continues to next steps', () => {
            let ruleId: string;

            beforeAll(async () => {
                ruleId = await createRecordInitRule([
                    {
                        type: AutomationRuleActions.condition,
                        params: {expression: 'true'} satisfies ConditionActionParams,
                    },
                    {
                        type: AutomationRuleActions.jexlCalculation,
                        params: {formula: '"condition was true"'},
                    },
                    {
                        type: AutomationRuleActions.modifyAttribute,
                        params: {attributePath: testLibraryLabelAttrId, mode: 'replace'},
                    },
                ]);
            });

            afterAll(async () => {
                await adminUserSdk.DeleteAutomationRule({ruleId});
            });

            test('should execute subsequent actions', async () => {
                const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                    attributeId: testLibraryLabelAttrId,
                    libraryId: testLibraryId,
                    recordId,
                });

                expect(res.records.list[0].property).toEqual([
                    expect.objectContaining({payload: 'condition was true'}),
                ]);
            });
        });

        describe('when condition is false, pipeline stops', () => {
            let ruleId: string;
            beforeAll(async () => {
                ruleId = await createRecordInitRule([
                    {
                        type: AutomationRuleActions.condition,
                        params: {expression: 'false'} satisfies ConditionActionParams,
                    },
                    {
                        type: AutomationRuleActions.jexlCalculation,
                        params: {formula: '"should not be set"'},
                    },
                    {
                        type: AutomationRuleActions.modifyAttribute,
                        params: {attributePath: testLibraryLabelAttrId, mode: 'replace'},
                    },
                ]);
            });

            afterAll(async () => {
                await adminUserSdk.DeleteAutomationRule({ruleId});
            });

            test('should not execute subsequent actions', async () => {
                const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                    attributeId: testLibraryLabelAttrId,
                    libraryId: testLibraryId,
                    recordId,
                });

                expect(res.records.list[0].property).toEqual([]);
            });
        });
    });

    describe('modifyAttributeAction validateParams', () => {
        it('should throw if the attribute does not exist', async () => {
            await expect(
                createRecordInitRule([
                    {
                        type: AutomationRuleActions.jexlCalculation,
                        params: {
                            formula: '"Default library label"',
                        },
                    },
                    {
                        type: AutomationRuleActions.modifyAttribute,
                        params: {
                            attributePath: 'attribute_does_not_exist',
                            mode: 'replace',
                        },
                    },
                ]),
            ).rejects.toThrow(/Unknown attribute: attribute_does_not_exist/);
        });
    });
});
