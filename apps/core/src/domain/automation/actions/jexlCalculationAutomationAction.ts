// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {z} from 'zod';
import {logger} from '@leav/logger';
import {type IJexlDomain} from '../../jexl/jexlDomain';
import {type IConfig} from '../../../_types/config';
import {ActionExecutionResultStatus, AutomationRuleActions, type IAutomationAction} from './_types';

const jexlCalculationActionParamsSchema = z.object({
    formula: z.string().meta({
        title: 'Jexl expression',
        description:
            'The Jexl expression to evaluate when this action is executed. https://aristid.atlassian.net/wiki/spaces/PRODUIT/pages/2087256077/Calcul+Jexl',
    }),
});

export type JexlCalculationActionParams = z.infer<typeof jexlCalculationActionParamsSchema>;

interface IDeps {
    'core.domain.jexl': IJexlDomain;
    config: IConfig;
}

export default function ({'core.domain.jexl': jexl, config}: IDeps): IAutomationAction<JexlCalculationActionParams> {
    const debug = config.actions?.jexl?.debug ?? false;
    return {
        type: AutomationRuleActions.JEXL_CALCULATION,
        paramsSchema: jexlCalculationActionParamsSchema,
        validateParams: params => jexl.validate(params.formula),
        async execute(params, state, ctx) {
            const jexlCtx = jexl.buildRootContext(
                {
                    results: state.results,
                    ...(state.trigger.eventTopic.record
                        ? {currentRecord: jexl.buildRecordContext(state.trigger.eventTopic.record, ctx)}
                        : {}),
                    // And other topics
                },
                ctx,
            );

            const result = await jexl.eval(params.formula, jexlCtx);

            debug && logger.debug(`Jexl calculation in automation: ${params.formula} => ${JSON.stringify(result)}`);

            return {
                status: ActionExecutionResultStatus.CONTINUE,
                result,
            };
        },
    };
}
