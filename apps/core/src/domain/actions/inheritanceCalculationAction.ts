// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ICalculationVariable} from 'domain/helpers/calculationVariable';
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';
import {AttributeTypes} from '../../_types/attribute';

interface IDeps {
    'core.domain.helpers.calculationVariable'?: ICalculationVariable;
    'core.domain.attribute'?: IAttributeDomain;
}

export default function ({
    'core.domain.helpers.calculationVariable': calculationVariable = null,
    'core.domain.attribute': attributeDomain = null
}: IDeps = {}): IActionsListFunction {
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
        action: async (values, params, ctx) => {
            const {Formula: formula} = params;
            const attrProps = await attributeDomain.getAttributeProperties({id: ctx.attribute.id, ctx});
            let inheritedValues = [];

            const result = await calculationVariable.processVariableString(ctx, formula, []);

            if (!result.length) {
                return {values, errors: []};
            }

            if (attrProps.type === AttributeTypes.SIMPLE_LINK || attrProps.type === AttributeTypes.ADVANCED_LINK) {
                inheritedValues = result.map(resultValue => ({
                    value: {id: String(resultValue.value), library: resultValue.library},
                    isInherited: true
                }));
            } else {
                inheritedValues = result.map(v => ({
                    value: v.value,
                    isInherited: true,
                    raw_value: v.raw_value
                }));
            }

            return {values: [...(values ?? []), ...inheritedValues], errors: []};
        }
    };
}
