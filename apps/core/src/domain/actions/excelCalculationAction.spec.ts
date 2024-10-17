// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListValueType, IActionsListContext} from '_types/actionsList';
import {ICalculationVariable, IVariableValue} from 'domain/helpers/calculationVariable';
import {IUtils} from 'utils/utils';
import excelCalculationAction from './excelCalculationAction';
import {IValue} from '_types/value';
import {Errors} from '../../_types/errors';
import {mockStandardValue} from '../../__tests__/mocks/value';

const mockCalculationsVariable = {
    processVariableString: async (
        ctx: IActionsListContext,
        variable: string,
        initialValue: ActionsListValueType
    ): Promise<IVariableValue[]> => [
        {
            payload: `${variable}Value`,
            recordId: '1',
            library: 'meh'
        }
    ]
};

const ctx = {userId: 'test_user'};

describe('excelCalculationAction', () => {
    const mockUtils: Mockify<IUtils> = {
        translateError: jest.fn().mockReturnValue('Excel calculation error')
    };

    const mockResultValueBase: IValue = {
        id_value: null,
        isCalculated: true,
        modified_at: null,
        modified_by: null,
        created_at: null,
        created_by: null,
        payload: null
    };

    test('Simple excelCalculation', async () => {
        const action = excelCalculationAction().action;
        const res = await action(
            [],
            {
                Description: 'test',
                Formula: '42'
            },
            ctx
        );

        expect(res).toEqual({errors: [], values: [{...mockResultValueBase, payload: '42', raw_payload: '42'}]});
        expect(
            await action(
                [],
                {
                    Description: 'test',
                    Formula: '42+42'
                },
                ctx
            )
        ).toEqual({errors: [], values: [{...mockResultValueBase, payload: '84', raw_payload: '84'}]});
    });

    test('no formula', async () => {
        const action = excelCalculationAction().action;
        const res = await action(
            [],
            {
                Description: 'test',
                Formula: ''
            },
            ctx
        );
        expect(res).toEqual({errors: [], values: [{...mockResultValueBase, payload: '', raw_payload: ''}]});
    });

    test('Replace variables', async () => {
        const action = excelCalculationAction({
            'core.domain.helpers.calculationVariable': mockCalculationsVariable as ICalculationVariable
        }).action;
        const res = await action(
            [],
            {
                Description: 'test',
                Formula: '"resultat {toto} {tata} {titi}"'
            },
            ctx
        );

        expect(res).toEqual({
            errors: [],
            values: [
                {
                    ...mockResultValueBase,
                    payload: 'resultat totoValue tataValue titiValue',
                    raw_payload: 'resultat totoValue tataValue titiValue'
                }
            ]
        });
    });

    test('Return origin values along calculation result', async () => {
        const action = excelCalculationAction({
            'core.domain.helpers.calculationVariable': mockCalculationsVariable as ICalculationVariable
        }).action;
        const res = await action(
            [mockStandardValue],
            {
                Description: 'test',
                Formula: '"resultat {toto} {tata} {titi}"'
            },
            ctx
        );

        expect(res).toEqual({
            errors: [],
            values: [
                mockStandardValue,
                {
                    ...mockResultValueBase,
                    payload: 'resultat totoValue tataValue titiValue',
                    raw_payload: 'resultat totoValue tataValue titiValue'
                }
            ]
        });
    });

    test('Error calculation', async () => {
        const action = excelCalculationAction({
            'core.utils': mockUtils as IUtils
        }).action;
        const res = await action(
            [],
            {
                Description: 'test',
                Formula: 'UNKNOWN'
            },
            ctx
        );

        expect(res).toEqual({
            errors: [
                {
                    errorType: Errors.EXCEL_CALCULATION_ERROR,
                    attributeValue: null
                }
            ],
            values: []
        });
    });
});
