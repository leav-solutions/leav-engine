// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {z} from 'zod';
import {
    type IAutomationAction,
    AutomationRuleActions,
    type IActionExecutionResult,
    ActionExecutionResultStatus,
} from './_types';
import {type IJexlAutomation} from '../jexl/jexlAutomation';
import {type ZodMetaUISchema} from '../../../_types/jsonSchemaForm';

const conditionActionParamsSchema = z.object({
    expression: z.string().meta({
        title: 'Expression (Jexl)',
        description:
            'The Jexl expression to determine the condition. If the result is true, the pipeline continues; otherwise, the pipeline stops.',
        ui: {
            title: 'automation.form.pipeline.params.condition.expression',
            placeholder: 'automation.form.pipeline.params.condition.expression_placeholder',
        },
    } satisfies ZodMetaUISchema),
});

export type ConditionActionParams = z.infer<typeof conditionActionParamsSchema>;

interface IConditionActionDeps {
    'core.domain.automation.jexl': IJexlAutomation;
}

export default function ({
    'core.domain.automation.jexl': jexlAutomation,
}: IConditionActionDeps): IAutomationAction<ConditionActionParams> {
    return {
        type: AutomationRuleActions.CONDITION,
        paramsSchema: conditionActionParamsSchema,
        validateStep: params => jexlAutomation.validate(params.step.params.expression),
        async execute(params, state, ctx): Promise<IActionExecutionResult> {
            const {expression} = params;

            const jexlCtx = jexlAutomation.buildAutomationContext(state, ctx);
            const conditionResult = await jexlAutomation.eval<boolean>(expression, jexlCtx);

            if (typeof conditionResult !== 'boolean') {
                throw new Error('Condition expression must evaluate to a boolean.');
            }

            return conditionResult === true
                ? {status: ActionExecutionResultStatus.CONTINUE, result: true}
                : {status: ActionExecutionResultStatus.STOP, reason: 'condition returned false'};
        },
    };
}
