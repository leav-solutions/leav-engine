// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

        it('should execute a simple pipeline with log action', async () => {
            await expect(
                pipelineDomain.executePipeline(
                    createPipelineToExecute([
                        {
                            type: AutomationRuleActions.LOG,
                            params: {
                                message: 'Test log from automation pipeline.test.ts',
                                level: 'info',
                            },
                        },
                    ]),
                    ctx,
                ),
            ).resolves.toBeTruthy();
        });

        it('should interrupt a pipeline with error action', async () => {
            await expect(
                pipelineDomain.executePipeline(
                    createPipelineToExecute([
                        {
                            type: AutomationRuleActions.ERROR,
                            params: {
                                message: 'This is an error',
                            },
                        },
                    ]),
                    ctx,
                ),
            ).resolves.toBeFalsy();
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
                            type: AutomationRuleActions.ERROR,
                            params: {
                                message: 'Will stop this pipeline',
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
                            type: AutomationRuleActions.ERROR,
                            params: {
                                message: 'Pipeline already stopped',
                            },
                        },
                    ]),
                    ctx,
                ),
            ).resolves.toBeFalsy();
        });
    });
});
