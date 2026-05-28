import {z} from 'zod';
import {logger} from '@leav/logger';
import {type ZodMetaUISchema} from '../../../_types/jsonSchemaForm';
import {type IConfig} from '../../../_types/config';
import {ActionExecutionResultStatus, AutomationRuleActions, type IAutomationAction} from './_types';
import {type IJexlAutomation} from '../jexl/jexlAutomation';

const jexlExpressionActionParamsSchema = z.object({
    expression: z.string().meta({
        title: 'Jexl expression',
        description:
            'The Jexl expression to evaluate when this action is executed. https://aristid.atlassian.net/wiki/spaces/PRODUIT/pages/2087256077/Calcul+Jexl',
        ui: {
            title: 'automation.form.pipeline.params.jexl_expression.expression',
            placeholder: 'automation.form.pipeline.params.jexl_expression.expression_placeholder',
        },
    } satisfies ZodMetaUISchema),
});

export type JexlExpressionActionParams = z.infer<typeof jexlExpressionActionParamsSchema>;

interface IDeps {
    'core.domain.automation.jexl': IJexlAutomation;
    config: IConfig;
}

export default function ({
    'core.domain.automation.jexl': jexlAutomation,
    config,
}: IDeps): IAutomationAction<JexlExpressionActionParams> {
    const debug = config.actions?.jexl?.debug ?? false;

    return {
        type: AutomationRuleActions.JEXL_EXPRESSION,
        paramsSchema: jexlExpressionActionParamsSchema,
        validateStep: params => jexlAutomation.validate(params.step.params.expression),
        async execute(params, state, ctx) {
            const jexlCtx = jexlAutomation.buildAutomationContext(state, ctx);
            const result = await jexlAutomation.eval(params.expression, jexlCtx);

            debug && logger.debug(`Jexl expression in automation: ${params.expression} => ${JSON.stringify(result)}`);

            return {
                status: ActionExecutionResultStatus.CONTINUE,
                result,
            };
        },
    };
}
