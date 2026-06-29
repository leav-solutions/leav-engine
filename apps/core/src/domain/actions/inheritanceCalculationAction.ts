import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type ICalculationVariable} from '../helpers/calculations/calculationVariable';
import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';
import {AttributeTypes} from '../../_types/attribute';

interface IDeps {
    'core.domain.helpers.calculationVariable'?: ICalculationVariable;
    'core.domain.attribute'?: IAttributeDomain;
}

type ActionParams = {
    Formula: true;
    Description: true;
    ['Return only calculated value']: false;
};

export default function ({
    'core.domain.helpers.calculationVariable': calculationVariable = null,
    'core.domain.attribute': attributeDomain = null,
}: IDeps = {}): IActionsListFunction<ActionParams> {
    return {
        id: 'inheritanceCalculation',
        name: 'Inheritance calculation',
        description: 'Inherit values from another record',
        input_types: [
            ActionsListIOTypes.STRING,
            ActionsListIOTypes.NUMBER,
            ActionsListIOTypes.OBJECT,
            ActionsListIOTypes.BOOLEAN,
        ],
        output_types: [
            ActionsListIOTypes.STRING,
            ActionsListIOTypes.NUMBER,
            ActionsListIOTypes.OBJECT,
            ActionsListIOTypes.BOOLEAN,
        ],
        compute: true,
        params: [
            {
                name: 'Description',
                type: 'string',
                description: 'Quick description of your calculation',
                required: true,
                helper_value: 'Your description',
            },
            {
                name: 'Formula',
                type: 'string',
                description: 'Variables function calls to perform. Ex: getValue(linked_products).getValue(image)',
                required: true,
                helper_value: '',
            },
            {
                name: 'Return only calculated value',
                type: 'boolean',
                description:
                    'Return only the calculated value, without the original values. For "get value" or "save value" actions, it is necessary to keep this unchecked to allow value override.',
                required: false,
                helper_value: 'false',
            },
        ],
        action: async (values, params, ctx) => {
            const {Formula: formula, ['Return only calculated value']: returnOnlyCalculatedValue} = params;
            const attrProps = await attributeDomain.getAttributeProperties({id: ctx.attribute.id, ctx});
            let inheritedValues = [];

            const result = await calculationVariable.processVariableString(ctx, formula, []);

            if (!result.length) {
                return {values: returnOnlyCalculatedValue === 'true' ? [] : values, errors: []};
            }

            if (attrProps.type === AttributeTypes.SIMPLE_LINK || attrProps.type === AttributeTypes.ADVANCED_LINK) {
                inheritedValues = result.map(resultValue => ({
                    payload: {id: String(resultValue.payload), library: resultValue.library},
                    raw_payload: {id: String(resultValue.raw_payload), library: resultValue.library},
                    isInherited: true,
                }));
            } else {
                inheritedValues = result.map(v => ({
                    payload: v.payload,
                    raw_payload: v.raw_payload,
                    isInherited: true,
                }));
            }

            return {
                values:
                    returnOnlyCalculatedValue === 'true' ? inheritedValues : [...(values ?? []), ...inheritedValues],
                errors: [],
            };
        },
    };
}
