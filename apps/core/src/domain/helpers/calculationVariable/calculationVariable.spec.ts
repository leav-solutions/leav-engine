// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListContext} from '_types/actionsList';
import calculationVariable, {IVariableValue} from '.';

const mockCalculationsVariableFunctions = {
    test: {
        run: async (context: IActionsListContext, initialValue: any, ...params: any[]): Promise<IVariableValue[]> => {
            return [
                {
                    recordId: '1',
                    library: 'meh',
                    value: 42
                }
            ];
        },
        after: []
    },
    test2: {
        run: async (context: IActionsListContext, initialValue: any, ...params: any[]): Promise<IVariableValue[]> => {
            return [
                {
                    recordId: '1',
                    library: 'meh',
                    value: initialValue[0].value + 10
                }
            ];
        },
        after: []
    }
};

describe('calculationVariable', () => {
    const calculation = calculationVariable({
        'core.domain.helpers.calculationsVariableFunctions': mockCalculationsVariableFunctions
    });

    test('empty variable', async () => {
        const res = await calculation.processVariableString({recordId: '1', library: 'meh'}, '', 'toto');
        expect(res[0].value).toBe('toto');
    });
    test('run variable function', async () => {
        const res = await calculation.processVariableString({recordId: '1', library: 'meh'}, 'test()', 'toto');
        expect(res[0].value).toBe(42);
    });
    test('run sequence of variable functions', async () => {
        const res = await calculation.processVariableString({recordId: '1', library: 'meh'}, 'test().test2()', 'toto');
        expect(res[0].value).toBe(52);
    });
    test('run unknown function', async () => {
        const res = calculation.processVariableString({recordId: '1', library: 'meh'}, 'meh()', 'toto');
        res.catch(e => {
            expect(e).toEqual(Error('Calculation variable: unknown function meh'));
        });
    });
});
