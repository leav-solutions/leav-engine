import {ActionsListEvents} from '../../../../../_types/actionsList';
import {adminUserSdk} from '../../e2eUtils';
import {AttributeFormat, AttributeType} from '../../../_gqlTypes';

describe('jexlCalculationAction', () => {
    const libraryId = 'test_jexl_calculation_action_library';
    const attrSimpleId = 'test_jexl_calculation_action_simple_attr';
    const attrCalcSimpleId = 'test_jexl_calculation_action_calc_simple_attr';

    let recordId: string;
    const aSimpleString = 'a simple string';

    beforeAll(async () => {
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: attrSimpleId,
                label: {en: 'Test jexl calculation action simple attr'},
                type: AttributeType.simple,
                format: AttributeFormat.text,
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: attrCalcSimpleId,
                label: {en: 'Test jexl calculation action calc simple attr'},
                type: AttributeType.simple,
                format: AttributeFormat.text,
            },
        });
        await adminUserSdk.SaveLibrary({
            library: {
                id: libraryId,
                label: {en: 'Test jexl calculation action lib'},
                attributes: [attrSimpleId, attrCalcSimpleId],
            },
        });

        const res = await adminUserSdk.CreateRecord({
            library: libraryId,
            data: {
                values: [
                    {
                        attribute: attrSimpleId,
                        payload: aSimpleString,
                    },
                ],
            },
        });
        recordId = res.createRecord.record.id;
    });

    describe('Simple attribute calculation', () => {
        beforeEach(async () => {
            await adminUserSdk.DeleteValue({
                recordId,
                library: libraryId,
                attribute: attrCalcSimpleId,
            });
        });

        it('Count characters in a string attribute', async () => {
            await adminUserSdk.SaveAttribute({
                attribute: {
                    id: attrCalcSimpleId,
                    label: {en: 'Test jexl calculation action calc simple attr'},
                    type: AttributeType.simple,
                    format: AttributeFormat.text,
                    actions_list: {
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                            },
                        ],
                        [ActionsListEvents.GET_VALUE]: [
                            {
                                id: 'jexlCalculation',
                                params: [
                                    {
                                        name: 'Formula',
                                        value: `currentRecord | getValues("${attrSimpleId}") | first | length`,
                                    },
                                ],
                            },
                        ],
                    },
                },
            });

            const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                attributeId: attrCalcSimpleId,
                libraryId,
                recordId,
            });

            const calculatedValue = res.records.list[0].property[0].payload;
            expect(calculatedValue).toBe(aSimpleString.length);
        });

        it('Auto uppercase saved value', async () => {
            await adminUserSdk.SaveAttribute({
                attribute: {
                    id: attrCalcSimpleId,
                    label: {en: 'Test jexl calculation action calc simple attr'},
                    type: AttributeType.simple,
                    format: AttributeFormat.text,
                    actions_list: {
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                            },
                            {
                                id: 'jexlCalculation',
                                params: [
                                    {
                                        name: 'Formula',
                                        value: 'currentValues | map("value | uppercase")',
                                    },
                                ],
                            },
                        ],
                    },
                },
            });

            await adminUserSdk.SaveValue({
                recordId,
                libraryId,
                attributeId: attrCalcSimpleId,
                value: {
                    payload: 'another string',
                },
            });

            const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                attributeId: attrCalcSimpleId,
                libraryId,
                recordId,
            });

            const calculatedValue = res.records.list[0].property[0].payload;
            expect(calculatedValue).toBe('ANOTHER STRING');
        });

        it('User current user language and email', async () => {
            await adminUserSdk.SaveAttribute({
                attribute: {
                    id: attrCalcSimpleId,
                    label: {en: 'Test jexl calculation action calc simple attr'},
                    type: AttributeType.simple,
                    format: AttributeFormat.text,
                    actions_list: {
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                            },
                        ],
                        [ActionsListEvents.GET_VALUE]: [
                            {
                                id: 'jexlCalculation',
                                params: [
                                    {
                                        name: 'Formula',
                                        value: 'currentUser.lang + " - " + first(getValues(currentUser.record, "email"))',
                                    },
                                ],
                            },
                        ],
                    },
                },
            });

            const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                attributeId: attrCalcSimpleId,
                libraryId,
                recordId,
            });

            const calculatedValue = res.records.list[0].property[0].payload;
            expect(calculatedValue).toBe('en - admin@test.leav-engine.com');
        });
    });
});
