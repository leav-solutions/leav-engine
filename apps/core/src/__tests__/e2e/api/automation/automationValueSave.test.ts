import {
    AutomationRuleEventAction,
    AutomationRuleActions,
    AttributeType,
    AttributeFormat,
    type LibraryInput,
    type AutomationRulePipelineStepInput,
} from '../../_gqlTypes';
import {adminUserSdk} from '../e2eUtils';

describe('Automation VALUE_SAVE', () => {
    const testLibraryId = 'automation_value_save_test_library';
    const sourceAttrId = 'automation_value_save_test_source_attr';
    const targetAttrId = 'automation_value_save_test_target_attr';
    const triggerAttrId = 'automation_value_save_test_trigger_attr';
    let recordId: string;

    beforeAll(async () => {
        for (const id of [sourceAttrId, targetAttrId, triggerAttrId]) {
            await adminUserSdk.SaveAttribute({
                attribute: {id, label: {en: id}, type: AttributeType.simple, format: AttributeFormat.text},
            });
        }
        await adminUserSdk.SaveLibrary({
            library: {
                id: testLibraryId,
                label: {en: 'Automation Value Save Test Library'},
                attributes: [sourceAttrId, targetAttrId, triggerAttrId],
            } as LibraryInput,
        });
    });

    beforeEach(async () => {
        recordId = (await adminUserSdk.CreateRecord({library: testLibraryId})).createRecord.record.id;
    });

    const createValueSaveRule = async (
        steps: AutomationRulePipelineStepInput[],
        opts: {attributeFilter?: string; synchronous?: boolean},
    ) =>
        (
            await adminUserSdk.CreateAutomationRule({
                rule: {
                    label: 'VALUE_SAVE rule for testing',
                    active: true,
                    trigger: {
                        synchronous: opts.synchronous ?? true,
                        eventAction: AutomationRuleEventAction.VALUE_SAVE,
                        eventTopic: {
                            library: testLibraryId,
                            ...(opts.attributeFilter ? {attribute: opts.attributeFilter} : {}),
                        },
                    },
                    pipeline: {steps},
                },
            })
        ).createAutomationRule.id;

    describe('triggers synchronously on a specific attribute', () => {
        let ruleId: string;
        beforeAll(async () => {
            ruleId = await createValueSaveRule(
                [
                    {type: AutomationRuleActions.jexlExpression, params: {expression: '"derived from source"'}},
                    {
                        type: AutomationRuleActions.modifyAttribute,
                        params: {attributePath: targetAttrId, mode: 'replace'},
                    },
                ],
                {attributeFilter: sourceAttrId},
            );
        });
        afterAll(async () => {
            await adminUserSdk.DeleteAutomationRule({ruleId});
        });

        test('rule pipeline writes targetAttr when sourceAttr value is saved', async () => {
            await adminUserSdk.SaveValue({
                libraryId: testLibraryId,
                attributeId: sourceAttrId,
                recordId,
                value: {payload: 'whatever'},
            });

            const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                attributeId: targetAttrId,
                libraryId: testLibraryId,
                recordId,
            });

            expect(res.records.list[0].property).toEqual([expect.objectContaining({payload: 'derived from source'})]);
        });
    });

    describe('triggers asynchronously on specific attribute', () => {
        let ruleId: string;
        beforeAll(async () => {
            ruleId = await createValueSaveRule(
                [
                    {type: AutomationRuleActions.jexlExpression, params: {expression: '"async fired"'}},
                    {
                        type: AutomationRuleActions.modifyAttribute,
                        params: {attributePath: targetAttrId, mode: 'replace'},
                    },
                ],
                {attributeFilter: sourceAttrId, synchronous: false},
            );
        });
        afterAll(async () => {
            await adminUserSdk.DeleteAutomationRule({ruleId});
        });

        const waitUntilPropertyPayload = async (attributeId: string, expectedPayload: string, timeoutMs = 2000) => {
            const deadline = Date.now() + timeoutMs;
            while (Date.now() < deadline) {
                const {records} = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                    attributeId,
                    libraryId: testLibraryId,
                    recordId,
                });
                if (records.list[0].property.some(v => v?.payload === expectedPayload)) {
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            throw new Error(`Timed out waiting for payload "${expectedPayload}" on ${attributeId}`);
        };

        test('rule fires when value is saved on an unrelated attribute of the library', async () => {
            await adminUserSdk.SaveValue({
                libraryId: testLibraryId,
                attributeId: sourceAttrId,
                recordId,
                value: {payload: 'anything'},
            });

            await waitUntilPropertyPayload(targetAttrId, 'async fired');
        });
    });

    describe('triggers on any attribute when topic omits attribute', () => {
        let ruleId: string;
        beforeAll(async () => {
            ruleId = await createValueSaveRule(
                [
                    {type: AutomationRuleActions.jexlExpression, params: {expression: '"wildcard fired"'}},
                    {
                        type: AutomationRuleActions.modifyAttribute,
                        params: {attributePath: targetAttrId, mode: 'replace'},
                    },
                ],
                {},
            );
        });
        afterAll(async () => {
            await adminUserSdk.DeleteAutomationRule({ruleId});
        });

        test('rule fires when value is saved on an unrelated attribute of the library', async () => {
            await adminUserSdk.SaveValue({
                libraryId: testLibraryId,
                attributeId: triggerAttrId,
                recordId,
                value: {payload: 'anything'},
            });

            const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                attributeId: targetAttrId,
                libraryId: testLibraryId,
                recordId,
            });

            expect(res.records.list[0].property).toEqual([expect.objectContaining({payload: 'wildcard fired'})]);
        });
    });
});
