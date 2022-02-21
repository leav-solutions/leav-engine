// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import heritageCalculationAction from './heritageCalculationAction';
import {ActionsListValueType, IActionsListContext} from '_types/actionsList';
import {ICalculationVariable, IVariableValue} from 'domain/helpers/calculationVariable';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {AttributeTypes} from '../../_types/attribute';

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

const mockAttributeDomain: Mockify<IAttributeDomain> = {
    getAttributeProperties: global.__mockPromise({type: 'meh'})
};

const action = heritageCalculationAction({
    'core.domain.helpers.calculationVariable': mockCalculationsVariable,
    'core.domain.attribute': mockAttributeDomain as IAttributeDomain
}).action;

describe('heritageCalculationAction', () => {
    test('Simply call processVariableString', async () => {
        const ctx: IActionsListContext = {
            attribute: {
                id: 'meh',
                type: AttributeTypes.SIMPLE
            }
        };
        const res = await action(
            null,
            {
                Formula: '42'
            },
            ctx
        );
        expect(res).toBe('42Value');
    });
    test('no formula', async () => {
        const ctx: IActionsListContext = {
            attribute: {
                id: 'meh',
                type: AttributeTypes.SIMPLE
            }
        };
        const res = await action(
            null,
            {
                Formula: ''
            },
            ctx
        );
        expect(res).toBe('Value');
    });
    test('Herit from link', async () => {
        const mockAttributeDomain2: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise({type: AttributeTypes.SIMPLE_LINK, linked_library: 'meh'})
        };
        const action2 = heritageCalculationAction({
            'core.domain.helpers.calculationVariable': mockCalculationsVariable,
            'core.domain.attribute': mockAttributeDomain2 as IAttributeDomain
        }).action;
        const ctx: IActionsListContext = {
            attribute: {
                id: 'bla',
                type: AttributeTypes.SIMPLE_LINK
            }
        };

        const res = await action2(
            null,
            {
                Formula: ''
            },
            ctx
        );
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('id');
        expect(res[0]).toHaveProperty('library');
        expect(res[0].id).toBe('Value');
        expect(res[0].library).toBe('meh');
    });
});
