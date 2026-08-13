import {type ILogger} from '@leav/logger';
import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {type ICalculationVariable, type IVariableValue} from '../helpers/calculations/calculationVariable';
import excelCalculationAction from './excelCalculationAction';
import {type IValue} from '../../_types/value';
import {Errors} from '../../_types/errors';
import {mockStandardValue} from '../../__tests__/mocks/value';
import {type IConfig} from '../../_types/config';

const mockCalculationsVariable = {
    processVariableString: vi.fn(),
};

const ctxForGet: IActionsListContext = {userId: 'test_user', actionEvent: ActionsListEvents.GET_VALUE};
const ctxForSave: IActionsListContext = {userId: 'test_user', actionEvent: ActionsListEvents.SAVE_VALUE};

describe('excelCalculationAction', () => {
    const mockResultValueBase: IValue = {
        id_value: null,
        isCalculated: true,
        modified_at: null,
        modified_by: null,
        created_at: null,
        created_by: null,
        payload: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockCalculationsVariable.processVariableString.mockImplementation(
            async (context: IActionsListContext, variable: string): Promise<IVariableValue[]> => [
                {
                    payload: `${variable}Value`,
                    raw_payload: `${variable}RawValue`,
                    recordId: '1',
                    library: 'meh',
                },
            ],
        );
    });

    describe('with hyperformula', () => {
        const _excelCalculationAction = excelCalculationAction({
            'core.domain.helpers.calculationVariable': mockCalculationsVariable as ICalculationVariable,
            config: {} as IConfig,
            'core.utils.logger': {} as ILogger,
        });

        test('Simple excelCalculation', async () => {
            const action = _excelCalculationAction.action;
            const res = await action(
                [],
                {
                    Description: 'test',
                    Formula: '42',
                },
                ctxForGet,
            );

            expect(res).toEqual({errors: [], values: [{...mockResultValueBase, payload: '42', raw_payload: '42'}]});
            expect(
                await action(
                    [],
                    {
                        Description: 'test',
                        Formula: '42+42',
                    },
                    ctxForGet,
                ),
            ).toEqual({errors: [], values: [{...mockResultValueBase, payload: '84', raw_payload: '84'}]});
            expect(
                await action(
                    [],
                    {
                        Description: 'test',
                        Formula: 'SUM(42,43,44)',
                    },
                    ctxForGet,
                ),
            ).toEqual({errors: [], values: [{...mockResultValueBase, payload: '129', raw_payload: '129'}]});
        });

        test('no formula', async () => {
            const action = _excelCalculationAction.action;
            const res = await action(
                [],
                {
                    Description: 'test',
                    Formula: '',
                },
                ctxForGet,
            );
            expect(res).toEqual({errors: [], values: [{...mockResultValueBase, payload: '', raw_payload: ''}]});
        });

        test('Replace variables', async () => {
            const action = _excelCalculationAction.action;
            const res = await action(
                [],
                {
                    Description: 'test',
                    Formula: 'T("resultat {toto} {tata} {titi}")',
                },
                ctxForGet,
            );

            expect(res).toEqual({
                errors: [],
                values: [
                    {
                        ...mockResultValueBase,
                        payload: 'resultat totoRawValue tataRawValue titiRawValue',
                        raw_payload: 'resultat totoRawValue tataRawValue titiRawValue',
                    },
                ],
            });
        });

        test('Replace variables with empty result', async () => {
            mockCalculationsVariable.processVariableString.mockImplementation(async (): Promise<IVariableValue[]> => [
                {
                    payload: '',
                    raw_payload: '',
                    recordId: '1',
                    library: 'meh',
                },
            ]);

            const action = _excelCalculationAction.action;
            const res = await action(
                [],
                {
                    Description: 'test empty result',
                    Formula: '{toto}',
                },
                ctxForGet,
            );

            expect(res).toEqual({
                errors: [],
                values: [
                    {
                        ...mockResultValueBase,
                        payload: '',
                        raw_payload: '',
                    },
                ],
            });
        });

        test('Return origin values along calculation result by default', async () => {
            const action = _excelCalculationAction.action;
            const res = await action(
                [mockStandardValue],
                {
                    Description: 'test',
                    Formula: 'T("resultat {toto} {tata} {titi}")',
                },
                ctxForGet,
            );

            expect(res).toEqual({
                errors: [],
                values: [
                    mockStandardValue,
                    {
                        ...mockResultValueBase,
                        payload: 'resultat totoRawValue tataRawValue titiRawValue',
                        raw_payload: 'resultat totoRawValue tataRawValue titiRawValue',
                    },
                ],
            });
        });

        test('Return not origin values along calculation result when "Return only calculated value" is true', async () => {
            const action = _excelCalculationAction.action;
            const res = await action(
                [mockStandardValue],
                {
                    Description: 'test',
                    Formula: 'T("resultat {toto} {tata} {titi}")',
                    'Return only calculated value': 'true',
                },
                ctxForSave,
            );

            expect(res).toEqual({
                errors: [],
                values: [
                    {
                        ...mockResultValueBase,
                        payload: 'resultat totoRawValue tataRawValue titiRawValue',
                        raw_payload: 'resultat totoRawValue tataRawValue titiRawValue',
                    },
                ],
            });
        });

        test('Error calculation with unknown function', async () => {
            const action = _excelCalculationAction.action;
            const res = await action(
                [],
                {
                    Description: 'test',
                    Formula: 'UNKNOWN',
                },
                ctxForGet,
            );

            expect(res).toEqual({
                errors: [
                    {
                        errorType: Errors.EXCEL_CALCULATION_ERROR,
                        attributeValue: null,
                        message: 'Error: Named expression UNKNOWN not recognized. in formula: -- =UNKNOWN --',
                    },
                ],
                values: [],
            });
        });

        test('Error calculation with wrong syntax', async () => {
            const action = _excelCalculationAction.action;
            const res = await action(
                [],
                {
                    Description: 'test',
                    Formula: 'SUM(42',
                },
                ctxForGet,
            );

            expect(res).toEqual({
                errors: [
                    {
                        errorType: Errors.EXCEL_CALCULATION_ERROR,
                        attributeValue: null,
                        message:
                            "Error: Parsing error. Expecting token of type --> RParen <-- but found --> '' <-- in formula: -- =SUM(42 --",
                    },
                ],
                values: [],
            });
        });
    });
});
