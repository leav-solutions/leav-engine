// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ICalculationVariable} from 'domain/helpers/calculationVariable';
import {IRecord} from '_types/record';
import {IValue} from '_types/value';
import {ActionsListIOTypes, ActionsListValueType, IActionsListContext} from '../../_types/actionsList';
import {AttributeTypes} from '../../_types/attribute';

interface IDeps {
    'core.domain.helpers.calculationVariable'?: ICalculationVariable;
    'core.domain.attribute'?: IAttributeDomain;
}

type ActionsListInheritanceValueType = string | number | boolean | {};

export interface IActionListInheritanceContext extends IActionsListContext {
    value?: ActionsListInheritanceValueType;
}

export default function({
    'core.domain.helpers.calculationVariable': calculationVariable = null,
    'core.domain.attribute': attributeDomain = null
}: IDeps = {}) {
    return {
        id: 'inheritanceCalculation',
        name: 'Inheritance calculation',
        description: 'Inherit values from another record',
        input_types: [
            ActionsListIOTypes.STRING,
            ActionsListIOTypes.NUMBER,
            ActionsListIOTypes.OBJECT,
            ActionsListIOTypes.BOOLEAN
        ],
        output_types: [
            ActionsListIOTypes.STRING,
            ActionsListIOTypes.NUMBER,
            ActionsListIOTypes.OBJECT,
            ActionsListIOTypes.BOOLEAN
        ],
        params: [
            {
                name: 'Description',
                type: 'string',
                description: 'Quick description of your calculation',
                required: true,
                default_value: 'Your description'
            },
            {
                name: 'Formula',
                type: 'string',
                description: 'Variables function calls to perform. Ex: getValue(linked_products).getValue(image)',
                required: true,
                default_value: ''
            }
        ],
        action: async (
            value: ActionsListValueType,
            params: any,
            ctx: IActionsListContext
        ): Promise<string | boolean | number | IValue | IRecord> => {
            const {Formula: formula} = params;
            const attrProps = await attributeDomain.getAttributeProperties({id: ctx.attribute.id, ctx});

            const result = await calculationVariable.processVariableString(ctx, formula, value);

            if (!result.length) {
                return null;
            }

            if (attrProps.type === AttributeTypes.SIMPLE_LINK || attrProps.type === AttributeTypes.ADVANCED_LINK) {
                return result.map(v => ({
                    id: String(v.value),
                    library: v.library
                }))[0];
            }

            const finalResult = result.map(v => v.value)[0];
            return finalResult;
        }
    };
}
