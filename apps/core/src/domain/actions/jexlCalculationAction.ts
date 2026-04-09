// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type IJexlDomain} from '../jexl/jexlDomain';
import {type IValue} from '../../_types/value';
import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';
import {type IConfig} from '../../_types/config';

interface IDeps {
    'core.domain.jexl': IJexlDomain;
    config: IConfig;
}

type ActionParams = {
    Formula: true;
    Description: true;
    ['Return only calculated value']: false; // Keep same logic as in inheritanceCalculation and excelCalculation
};

export default function ({'core.domain.jexl': jexlDomain, config}: IDeps): IActionsListFunction<ActionParams> {
    const debug = config.actions.jexl.debug ?? false;

    const _buildValueResult = (result: unknown): IValue => ({
        id_value: null,
        isCalculated: true,
        modified_at: null,
        modified_by: null,
        created_at: null,
        created_by: null,
        payload: result,
        raw_payload: result,
    });

    return {
        id: 'jexlCalculation',
        name: 'Jexl calculation',
        description: 'Performs a Jexl calculation',
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
                description: 'Jexl formula to perform',
                required: true,
                helper_value: 'currentRecord | getValues("attr_label") | first | uppercase',
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
        async action(values, params, ctx) {
            const {Formula: formula, ['Return only calculated value']: returnOnlyCalculatedValue} = params;
            if (formula === '') {
                return {
                    values: returnOnlyCalculatedValue === 'true' ? [] : values,
                    errors: [],
                };
            }

            try {
                const jexlCtx = jexlDomain.buildRootContext(
                    {
                        currentRecord: jexlDomain.buildRecordContext({id: ctx.recordId, library: ctx.library}, ctx),
                        currentValues: jexlDomain.buildValuesContext(values, ctx),
                    },
                    ctx,
                );

                const result = await jexlDomain.eval(formula, jexlCtx);

                debug && logger.debug(`Jexl calculation: ${formula} => ${JSON.stringify(result)}`);

                const finalResults: IValue[] = Array.isArray(result)
                    ? result.map(r => _buildValueResult(r))
                    : [_buildValueResult(result)];

                return {
                    values: returnOnlyCalculatedValue === 'true' ? finalResults : [...values, ...finalResults],
                    errors: [],
                };
            } catch (error) {
                debug && logger.debug(`Jexl calculation error: ${formula} => ${error.message}`);
                throw error;
            }
        },
    };
}
