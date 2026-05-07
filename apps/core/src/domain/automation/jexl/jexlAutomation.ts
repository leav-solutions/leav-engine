// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IJexlDomain} from '../../jexl/jexlDomain';
import {type IAutomationPipelineExecutionState} from '../pipeline/_types';
import {type JexlRootContext, type JexlRecordContext} from '../../jexl/types';

interface IDeps {
    'core.domain.jexl': IJexlDomain;
}

type JexlAutomationContext = JexlRootContext<{
    results: IAutomationPipelineExecutionState['results'];
    currentRecord?: JexlRecordContext;
}>;

export interface IJexlAutomation extends Pick<IJexlDomain, 'eval' | 'validate'> {
    buildAutomationContext: (
        executionState: IAutomationPipelineExecutionState,
        ctx: IQueryInfos,
    ) => JexlAutomationContext;
}

export default function ({'core.domain.jexl': jexlDomain}: IDeps): IJexlAutomation {
    function buildAutomationContext(
        executionState: IAutomationPipelineExecutionState,
        ctx: IQueryInfos,
    ): JexlAutomationContext {
        return jexlDomain.buildRootContext(
            {
                results: executionState.results,
                ...(executionState.trigger.eventTopic?.record
                    ? {currentRecord: jexlDomain.buildRecordContext(executionState.trigger.eventTopic.record, ctx)}
                    : {}),
                // And other topics
            },
            ctx,
        );
    }

    return {
        eval: jexlDomain.eval,
        validate: jexlDomain.validate,
        buildAutomationContext,
    };
}
