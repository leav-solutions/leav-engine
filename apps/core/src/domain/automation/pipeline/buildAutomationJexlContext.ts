// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IJexlDomain} from '../../jexl/jexlDomain';
import {type JexlRootContext} from '../../jexl/types';
import {type IAutomationPipelineExecutionState} from './_types';

export type BuildAutomationJexlContext = (
    executionState: IAutomationPipelineExecutionState,
    ctx: IQueryInfos,
) => JexlRootContext;

export interface IBuildAutomationJexlContextDeps {
    'core.domain.jexl': IJexlDomain;
}

export default function ({
    'core.domain.jexl': jexlDomain,
}: IBuildAutomationJexlContextDeps): BuildAutomationJexlContext {
    return (executionState, ctx) =>
        jexlDomain.buildRootContext(
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
