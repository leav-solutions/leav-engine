// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IVariableValue} from 'domain/helpers/calculationVariable';
import {IActionsListContext} from '_types/actionsList';
import {IRecord} from '_types/record';
import {AttributeTypes} from '../../_types/attribute';
import inheritanceCalculationAction from './inheritanceCalculationAction';

const mockCalculationsVariable = {
    processVariableString: async (ctx: IActionsListContext, variable: string): Promise<IVariableValue[]> => [
        {
            payload: `${variable}Value`,
            raw_payload: 'testRawValue',
            recordId: '1',
            library: 'meh'
        }
    ]
};

const mockAttributeDomain: Mockify<IAttributeDomain> = {
    getAttributeProperties: global.__mockPromise({type: 'meh'})
};

const action = inheritanceCalculationAction({
    'core.domain.helpers.calculationVariable': mockCalculationsVariable,
    'core.domain.attribute': mockAttributeDomain as IAttributeDomain
}).action;

describe('inheritanceCalculationAction', () => {
    test('Simply call processVariableString', async () => {
        const ctx: IActionsListContext = {
            attribute: {
                id: 'meh',
                type: AttributeTypes.SIMPLE
            },
            userId: 'test'
        };

        const res = await action(
            null,
            {
                Description: 'test',
                Formula: '42'
            },
            ctx
        );

        expect(res.values[0].payload).toBe('42Value');
        expect((res.values[0] as any).raw_payload).toBe('42Value');
    });

    test('No formula', async () => {
        const ctx: IActionsListContext = {
            attribute: {
                id: 'meh',
                type: AttributeTypes.SIMPLE
            },
            userId: 'test'
        };
        const res = await action(
            null,
            {
                Description: 'test',
                Formula: ''
            },
            ctx
        );

        expect(res.values[0].payload).toBe('Value');
    });

    test('Inherit from link', async () => {
        const mockAttributeDomain2: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise({type: AttributeTypes.SIMPLE_LINK, linked_library: 'meh'})
        };
        const action2 = inheritanceCalculationAction({
            'core.domain.helpers.calculationVariable': mockCalculationsVariable,
            'core.domain.attribute': mockAttributeDomain2 as IAttributeDomain
        }).action;
        const ctx: IActionsListContext = {
            attribute: {
                id: 'bla',
                type: AttributeTypes.SIMPLE_LINK
            },
            userId: 'test'
        };

        const res = await action2(
            null,
            {
                Description: 'test',
                Formula: ''
            },
            ctx
        );

        const resultValue = res.values[0].payload;

        expect(resultValue).toHaveProperty('id');
        expect(resultValue).toHaveProperty('library');
        expect(resultValue.id).toBe('Value');
        expect(resultValue.library).toBe('meh');
    });
});
