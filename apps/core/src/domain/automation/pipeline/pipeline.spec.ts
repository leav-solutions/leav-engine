// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {z} from 'zod';
import {type Mock} from 'vitest';
import {
    SyncAutomationRuleEventAction,
    type AutomationRulePipelineStep,
    type AutomationRuleTrigger,
} from '../../../_types/automation';
import {type IQueryInfos} from '../../../_types/queryInfos';
import createPipelineExecutor, {type AutomationPipelineToExecute} from './pipeline';
import {type IAutomationAction} from '../actions/_types';
import {ActionExecutionResultStatus, type IActionExecutionResult} from '../_types';
import {type IEventsManagerDomain} from '../../eventsManager/eventsManagerDomain';
import {type IAutomationActionsRegistry} from '../automationActionsRegistry';

const eventManager: Mockify<IEventsManagerDomain> = {
    sendDatabaseEvent: vi.fn(),
};
const actionsRegistry: Mockify<IAutomationActionsRegistry> = {
    getAction: vi.fn(),
};

describe('pipelineExecutor', () => {
    const makeMockAction = (type: string, executeResult?: IActionExecutionResult): IAutomationAction => ({
        type,
        paramsSchema: z.object({}), // permissive schema — param validation is not the focus here
        execute: vi.fn().mockResolvedValue(executeResult),
    });

    const mockGetAction =
        (actions: IAutomationAction[]) =>
        (type: string): IAutomationAction => {
            const action = actions.find(a => a.type === type);
            if (action) {
                return action;
            }
            throw new Error(`Action ${type} not found in registry`);
        };

    const actionA = makeMockAction('A');
    const actionB = makeMockAction('B');
    const actionC = makeMockAction('C');
    const executor = createPipelineExecutor({
        'core.domain.automation.actionsRegistry': actionsRegistry as IAutomationActionsRegistry,
        'core.domain.eventsManager': eventManager as IEventsManagerDomain,
    });
    beforeEach(() => {
        vi.resetAllMocks();
        actionsRegistry.getAction.mockImplementation(mockGetAction([actionA, actionB, actionC]));
    });

    describe('execute', () => {
        const mockTrigger: AutomationRuleTrigger = {
            synchronous: false,
            eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
        };
        const mockCtx = {userId: '1'} as IQueryInfos;

        const createPipelineToExecute = (actions: AutomationRulePipelineStep[]): AutomationPipelineToExecute => ({
            ruleId: 'ruleId',
            steps: actions,
            trigger: mockTrigger,
        });
        const makeStep = (type: string, params: Record<string, unknown> = {}): AutomationRulePipelineStep => ({
            type,
            params,
        });

        it('runs all steps when all actions return void (treated as CONTINUE)', async () => {
            await expect(
                executor.executePipeline(createPipelineToExecute([makeStep('A'), makeStep('B')]), mockCtx),
            ).resolves.toBeTruthy();

            expect(actionA.execute).toHaveBeenCalledTimes(1);
            expect(actionB.execute).toHaveBeenCalledTimes(1);
        });

        it('stops pipeline at STOP status and skips subsequent actions', async () => {
            actionA.execute = vi.fn().mockResolvedValue({status: ActionExecutionResultStatus.STOP});

            await expect(
                executor.executePipeline(createPipelineToExecute([makeStep('A'), makeStep('B')]), mockCtx),
            ).resolves.toBeTruthy();

            expect(actionA.execute).toHaveBeenCalledTimes(1);
            expect(actionB.execute).not.toHaveBeenCalled();
        });

        it('interrupts pipeline when an action throws, without rethrowing', async () => {
            (actionA.execute as Mock).mockRejectedValue(new Error('boom'));

            await expect(
                executor.executePipeline(createPipelineToExecute([makeStep('A'), makeStep('B')]), mockCtx),
            ).resolves.toBeFalsy();
            expect(actionB.execute).not.toHaveBeenCalled();
        });

        it('skips unknown action type and continues with remaining actions', async () => {
            await expect(
                executor.executePipeline(
                    createPipelineToExecute([makeStep('A'), makeStep('UNKNOWN'), makeStep('B')]),
                    mockCtx,
                ),
            ).resolves.toBeFalsy();

            expect(actionA.execute).toHaveBeenCalledTimes(1);
            expect(actionB.execute).not.toHaveBeenCalled();
        });

        it('(temporary here for now) interrupts pipeline when params validation fails, without rethrowing', async () => {
            const actionMissingParams: IAutomationAction = {
                type: 'A',
                paramsSchema: z.object({x: z.string()}), // requires x: string
                execute: vi.fn(),
            };
            actionsRegistry.getAction.mockImplementation(mockGetAction([actionMissingParams, actionB]));

            // Passing empty params — fails the schema
            await expect(
                executor.executePipeline(createPipelineToExecute([makeStep('A', {}), makeStep('B')]), mockCtx),
            ).resolves.toBeFalsy();

            expect(actionMissingParams.execute).not.toHaveBeenCalled();
            expect(actionB.execute).not.toHaveBeenCalled();
        });

        it('(temporary here for now) calls optional validateParams after schema validation when defined', async () => {
            const validateParams = vi.fn();
            const action: IAutomationAction = {
                type: 'A',
                paramsSchema: z.object({}),
                validateParams,
                execute: vi.fn(),
            };
            actionsRegistry.getAction.mockImplementation(mockGetAction([action]));

            await expect(
                executor.executePipeline(createPipelineToExecute([makeStep('A')]), mockCtx),
            ).resolves.toBeTruthy();

            expect(validateParams).toHaveBeenCalledTimes(1);
        });

        describe('event emission', () => {
            it('sends AUTOMATION_PIPELINE_SUCCESS on full completion', async () => {
                await executor.executePipeline(createPipelineToExecute([makeStep('A'), makeStep('B')]), mockCtx);

                expect(eventManager.sendDatabaseEvent).toHaveBeenCalledTimes(1);
                expect(eventManager.sendDatabaseEvent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        action: EventAction.AUTOMATION_PIPELINE_SUCCESS,
                        topic: {automationRule: 'ruleId'},
                        after: expect.objectContaining({results: expect.any(Object)}),
                        metadata: expect.objectContaining({durationMs: expect.any(Number)}),
                    }),
                    mockCtx,
                );
            });

            it('sends AUTOMATION_PIPELINE_SUCCESS even when a STOP breaks the loop early', async () => {
                actionA.execute = vi.fn().mockResolvedValue({status: ActionExecutionResultStatus.STOP});

                await executor.executePipeline(createPipelineToExecute([makeStep('A'), makeStep('B')]), mockCtx);

                expect(eventManager.sendDatabaseEvent).toHaveBeenCalledWith(
                    expect.objectContaining({action: EventAction.AUTOMATION_PIPELINE_SUCCESS}),
                    mockCtx,
                );
            });

            it('sends AUTOMATION_PIPELINE_FAILURE when an action throws, with step index and error details', async () => {
                const error = new Error('boom');
                (actionA.execute as Mock).mockRejectedValue(error);

                await executor.executePipeline(createPipelineToExecute([makeStep('A'), makeStep('B')]), mockCtx);

                expect(eventManager.sendDatabaseEvent).toHaveBeenCalledTimes(1);
                expect(eventManager.sendDatabaseEvent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        action: EventAction.AUTOMATION_PIPELINE_FAILURE,
                        topic: {automationRule: 'ruleId'},
                        after: {
                            results: {
                                '0': expect.objectContaining({
                                    message: 'boom',
                                    name: 'Error',
                                }),
                            },
                        },
                        metadata: expect.objectContaining({durationMs: expect.any(Number)}),
                    }),
                    mockCtx,
                );
            });

            it('sends AUTOMATION_PIPELINE_FAILURE with step name when the failing step has one', async () => {
                (actionA.execute as Mock).mockRejectedValue(new Error('named step error'));

                await executor.executePipeline(
                    createPipelineToExecute([{...makeStep('A'), name: 'myNamedStep'}]),
                    mockCtx,
                );

                expect(eventManager.sendDatabaseEvent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        after: {
                            results: {
                                myNamedStep: expect.objectContaining({
                                    message: 'named step error',
                                    name: 'Error',
                                }),
                            },
                        },
                    }),
                    mockCtx,
                );
            });

            it('sends AUTOMATION_PIPELINE_FAILURE when params validation fails', async () => {
                const strictAction: IAutomationAction = {
                    type: 'A',
                    paramsSchema: z.object({x: z.string()}),
                    execute: vi.fn(),
                };
                actionsRegistry.getAction.mockImplementation(mockGetAction([strictAction]));

                await executor.executePipeline(createPipelineToExecute([makeStep('A', {})]), mockCtx);

                expect(eventManager.sendDatabaseEvent).toHaveBeenCalledWith(
                    expect.objectContaining({action: EventAction.AUTOMATION_PIPELINE_FAILURE}),
                    mockCtx,
                );
            });
        });

        describe('results accumulation', () => {
            it('passes accumulated results to subsequent actions via state', async () => {
                actionA.execute = vi.fn().mockResolvedValue({
                    status: ActionExecutionResultStatus.CONTINUE,
                    result: 'resultA',
                });

                await executor.executePipeline(createPipelineToExecute([makeStep('A'), makeStep('B')]), mockCtx);

                expect(actionB.execute).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({results: expect.objectContaining({0: 'resultA'})}),
                    mockCtx,
                );
            });

            it('makes named-step result accessible to subsequent actions via state (non-enumerable)', async () => {
                actionA.execute = vi.fn().mockResolvedValue({
                    status: ActionExecutionResultStatus.CONTINUE,
                    result: 'resultA',
                });

                await executor.executePipeline(
                    createPipelineToExecute([{...makeStep('A'), name: 'myStep'}, makeStep('B')]),
                    mockCtx,
                );

                expect(actionB.execute).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({results: expect.objectContaining({myStep: 'resultA'})}),
                    mockCtx,
                );
            });

            it('includes only indexed (enumerable) results in the SUCCESS event — not step names', async () => {
                actionA.execute = vi.fn().mockResolvedValue({
                    status: ActionExecutionResultStatus.CONTINUE,
                    result: 'resultA',
                });

                await executor.executePipeline(createPipelineToExecute([{...makeStep('A'), name: 'myStep'}]), mockCtx);

                const [[payload]] = (eventManager.sendDatabaseEvent as Mock).mock.calls;
                console.log('payload.after :>> ', payload.after);
                expect(payload.after.results).toEqual({0: 'resultA'});
                expect(Object.keys(payload.after.results)).not.toContain('myStep');
            });
        });
    });
});
