// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import calculationVariable, {IVariableValue} from '.';
const mockCalculationsVariableFunctions = {
    test: {
        run: async (): Promise<IVariableValue[]> => [
            {
                recordId: '1',
                library: 'meh',
                payload: 42
            }
        ],
        after: []
    },
    test2: {
        run: async (_, initialValues: any[]): Promise<IVariableValue[]> => [
            {
                recordId: '1',
                library: 'meh',
                payload: initialValues[0].payload + 10
            }
        ],
        after: []
    }
};

describe('calculationVariable', () => {
    const calculation = calculationVariable({
        'core.domain.helpers.calculationsVariableFunctions': mockCalculationsVariableFunctions
    });

    const ctx = {
        userId: 'test',
        recordId: '1',
        library: 'meh'
    };

    test('empty variable', async () => {
        const res = await calculation.processVariableString(ctx, '', ['toto']);
        expect(res[0].payload).toEqual(['toto']);
    });

    test('run variable function', async () => {
        const res = await calculation.processVariableString(ctx, 'test()', ['toto']);
        expect(res[0].payload).toBe(42);
    });

    test('run sequence of variable functions', async () => {
        const res = await calculation.processVariableString(ctx, 'test().test2()', ['toto']);
        expect(res[0].payload).toBe(52);
    });

    test('run unknown function', async () => {
        const res = calculation.processVariableString(ctx, 'meh()', ['toto']);
        res.catch(e => {
            expect(e).toEqual(Error('Invalid request'));
        });
    });
});
