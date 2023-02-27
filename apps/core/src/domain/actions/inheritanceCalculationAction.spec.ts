// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IVariableValue} from 'domain/helpers/calculationVariable';
import {ActionsListValueType, IActionsListContext} from '_types/actionsList';
import {IRecord} from '_types/record';
import {AttributeTypes} from '../../_types/attribute';
import inheritanceCalculationAction from './inheritanceCalculationAction';

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

const action = inheritanceCalculationAction({
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

    test('No formula', async () => {
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
            }
        };

        const res = (await action2(
            null,
            {
                Formula: ''
            },
            ctx
        )) as IRecord;

        expect(res).toHaveProperty('id');
        expect(res).toHaveProperty('library');
        expect(res.id).toBe('Value');
        expect(res.library).toBe('meh');
    });
});
