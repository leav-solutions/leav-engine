import {
    AutomationRuleEventAction,
    AutomationRuleActions,
    AttributeType,
    AttributeFormat,
    type LibraryInput,
} from '../../_gqlTypes';
import {adminUserSdk} from '../e2eUtils';

// Covers the anti-infinite-loop guard (automation.maxChainDepth, default 5): three individually
// valid rules whose composition is circular (A→B, B→C, C→A), each writing <previous> + 1 so the
// no-op short-circuit of modifyAttribute never stops the chain. Without the guard this loop is
// unbounded; with it, the chain is cut after exactly maxChainDepth automation writes.
describe('Automation chain depth guard', () => {
    const testLibraryId = 'automation_chain_depth_test_library';
    const attrA = 'automation_chain_depth_test_attr_a';
    const attrB = 'automation_chain_depth_test_attr_b';
    const attrC = 'automation_chain_depth_test_attr_c';
    const ruleIds: string[] = [];
    let recordId: string;

    const incrementExpression = (sourceAttr: string) =>
        `($.currentRecord | getValues("${sourceAttr}") | first | parseInt(10)) + 1`;

    beforeAll(async () => {
        for (const id of [attrA, attrB, attrC]) {
            await adminUserSdk.SaveAttribute({
                attribute: {id, label: {en: id}, type: AttributeType.simple, format: AttributeFormat.numeric},
            });
        }
        await adminUserSdk.SaveLibrary({
            library: {
                id: testLibraryId,
                label: {en: 'Automation Chain Depth Test Library'},
                attributes: [attrA, attrB, attrC],
            } as LibraryInput,
        });

        for (const [sourceAttr, targetAttr] of [
            [attrA, attrB],
            [attrB, attrC],
            [attrC, attrA],
        ]) {
            const {createAutomationRule} = await adminUserSdk.CreateAutomationRule({
                rule: {
                    label: `Chain depth test: ${sourceAttr} increments ${targetAttr}`,
                    active: true,
                    trigger: {
                        synchronous: true,
                        eventAction: AutomationRuleEventAction.VALUE_SAVE,
                        eventTopic: {library: testLibraryId, attribute: sourceAttr},
                    },
                    pipeline: {
                        steps: [
                            {
                                type: AutomationRuleActions.jexlExpression,
                                params: {expression: incrementExpression(sourceAttr)},
                            },
                            {
                                type: AutomationRuleActions.modifyAttribute,
                                params: {attributePath: targetAttr, mode: 'replace'},
                            },
                        ],
                    },
                },
            });
            ruleIds.push(createAutomationRule.id);
        }

        recordId = (await adminUserSdk.CreateRecord({library: testLibraryId})).createRecord.record.id;
    });

    afterAll(async () => {
        for (const ruleId of ruleIds) {
            await adminUserSdk.DeleteAutomationRule({ruleId});
        }
    });

    const getPayload = async (attributeId: string): Promise<unknown> => {
        const {records} = await adminUserSdk.GetRecordByIdStandardValuesProperty({
            attributeId,
            libraryId: testLibraryId,
            recordId,
        });
        return records.list[0].property[0]?.payload;
    };

    test('circular rules are cut after maxChainDepth automation writes instead of looping forever', async () => {
        await adminUserSdk.SaveValue({
            libraryId: testLibraryId,
            attributeId: attrA,
            recordId,
            value: {payload: '1'},
        });

        // maxChainDepth defaults to 5: user writes A=1 (depth 0), then B=2 (1), C=3 (2), A=4 (3),
        // B=5 (4), C=6 (5) — the writes of that 5th rebound carry depth 5 and are cut by the guard.
        expect(await getPayload(attrA)).toBe(4);
        expect(await getPayload(attrB)).toBe(5);
        expect(await getPayload(attrC)).toBe(6);

        // The values must stay frozen: nothing (including the async path) may keep the loop alive.
        await new Promise(resolve => setTimeout(resolve, 500));
        expect(await getPayload(attrA)).toBe(4);
        expect(await getPayload(attrB)).toBe(5);
        expect(await getPayload(attrC)).toBe(6);
    });
});
