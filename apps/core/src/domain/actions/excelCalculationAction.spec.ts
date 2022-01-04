// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import excelCalculationAction from './excelCalculationAction';
import {IValueDomain} from 'domain/value/valueDomain';
import {ActionsListValueType, IActionsListContext} from '_types/actionsList';
import {ICalculationVariable, IVariableValue} from 'domain/helpers/calculationVariable';

const mockCalculationsVariable = {
    processVariableString: async (
        ctx: IActionsListContext,
        variable: string,
        initialValue: ActionsListValueType
    ): Promise<IVariableValue[]> => {
        return [
            {
                value: `${variable}Value`,
                recordId: '1',
                library: 'meh'
            }
        ];
    }
};

describe('excelCalculationAction', () => {
    test('Simple excelCalculation', async () => {
        const action = excelCalculationAction().action;
        const ctx = {};
        const res = await action(
            null,
            {
                Formula: '42'
            },
            ctx
        );
        expect(res).toBe('42');
        expect(
            await action(
                null,
                {
                    Formula: '42+42'
                },
                ctx
            )
        ).toBe('84');
    });
    test('no formula', async () => {
        const action = excelCalculationAction().action;
        const ctx = {};
        const res = await action(
            null,
            {
                Formula: ''
            },
            ctx
        );
        expect(res).toBe('');
    });
    test('Replace variables', async () => {
        const action = excelCalculationAction({
            'core.domain.helpers.calculationVariable': mockCalculationsVariable as ICalculationVariable
        }).action;
        const ctx = {};
        const res = await action(
            38,
            {
                Formula: '"resultat {toto} {tata} {titi}"'
            },
            ctx
        );
        expect(res).toBe('resultat totoValue tataValue titiValue');
    });
    test('Error calculation', async () => {
        const mockValueDomain: Mockify<IValueDomain> = {
            getValues: global.__mockPromise([{value: 'test'}])
        };
        const action = excelCalculationAction().action;
        const ctx = {};
        const res = await action(
            null,
            {
                Formula: 'UNKNOWN'
            },
            ctx
        );
        expect(res).toContain('Excel calculation error');
    });
});
