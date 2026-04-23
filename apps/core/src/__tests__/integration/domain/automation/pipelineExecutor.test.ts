// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AutomationRulePipelineStep, SyncAutomationRuleEventAction} from '../../../../_types/automation';
import {type AutomationPipelineToExecute, type IPipelineExecutor} from '../../../../domain/automation/pipelineExecutor';
import {systemUserId} from '../../../../_constants/users';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {getCoreDep} from '../../integrationTestUtils';
import {AutomationRuleActions} from '../../../../domain/automation/actions/_types';

describe('pipelineExecutor', () => {
    let pipelineExecutor: IPipelineExecutor;
    const ctx: IQueryInfos = {userId: systemUserId};
    beforeAll(async () => {
        pipelineExecutor = getCoreDep<IPipelineExecutor>('core.domain.automation.pipelineExecutor');
    });

    describe('execute', () => {
        const createPipelineToExecute = (actions: AutomationRulePipelineStep[]): AutomationPipelineToExecute => ({
            ruleId: 'testRuleId',
            steps: actions,
            trigger: {
                eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
                synchronous: false,
            },
        });

        it('should execute a simple pipeline with log action', async () => {
            await expect(
                pipelineExecutor.executePipeline(
                    createPipelineToExecute([
                        {
                            type: AutomationRuleActions.LOG,
                            params: {
                                message: 'Test log from pipelineExecutor.spec.ts',
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
                pipelineExecutor.executePipeline(
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
                pipelineExecutor.executePipeline(
                    createPipelineToExecute([
                        {
                            type: AutomationRuleActions.CONDITION,
                            params: {
                                result: true,
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
                pipelineExecutor.executePipeline(
                    createPipelineToExecute([
                        {
                            type: AutomationRuleActions.CONDITION,
                            params: {
                                result: false,
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
            ).resolves.toBeTruthy();
        });
    });
});
