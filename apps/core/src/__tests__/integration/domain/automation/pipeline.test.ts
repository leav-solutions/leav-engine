import {SyncAutomationRuleEventAction} from '../../../../_types/automation';
import {
    type AutomationRulePipelineStep,
    type AutomationPipelineExecution,
} from '../../../../domain/automation/pipeline/_types';
import {systemUserId} from '../../../../_constants/users';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {getCoreDep} from '../../integrationTestUtils';
import {AutomationRuleActions} from '../../../../domain/automation/actions/_types';
import {type IAutomationPipelineDomain} from '../../../../domain/automation/pipeline/pipeline';

describe('automation pipeline', () => {
    let pipelineDomain: IAutomationPipelineDomain;

    const ctx: IQueryInfos = {userId: systemUserId};
    beforeAll(async () => {
        pipelineDomain = getCoreDep<IAutomationPipelineDomain>('core.domain.automation.pipeline');
    });

    describe('execute', () => {
        const createPipelineToExecute = (actions: AutomationRulePipelineStep[]): AutomationPipelineExecution => ({
            ruleId: 'testRuleId',
            steps: actions,
            trigger: {
                eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                synchronous: false,
            },
        });

        it('should execute a pipeline with condition action that continues', async () => {
            await expect(
                pipelineDomain.executePipeline(
                    createPipelineToExecute([
                        {
                            type: AutomationRuleActions.CONDITION,
                            params: {
                                expression: 'true',
                            },
                        },
                        {
                            type: AutomationRuleActions.JEXL_EXPRESSION,
                            params: {
                                formula: 'false',
                            },
                        },
                    ]),
                    ctx,
                ),
            ).resolves.toBeFalsy();
        });

        it('should execute a pipeline with condition action that stops', async () => {
            await expect(
                pipelineDomain.executePipeline(
                    createPipelineToExecute([
                        {
                            type: AutomationRuleActions.CONDITION,
                            params: {
                                expression: 'false',
                            },
                        },
                        {
                            type: AutomationRuleActions.JEXL_EXPRESSION,
                            params: {
                                formula: 'false',
                            },
                        },
                    ]),
                    ctx,
                ),
            ).resolves.toBeTruthy();
        });
    });
});
