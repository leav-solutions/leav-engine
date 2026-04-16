// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AwilixContainer} from 'awilix';
import {z} from 'zod';
import {
    SyncAutomationRuleEventAction,
    type AutomationRulePipelineStep,
    type AutomationRuleTrigger,
} from '../../_types/automation';
import {type IQueryInfos} from '../../_types/queryInfos';
import createPipelineExecutor, {type AutomationPipelineToExecute} from './pipelineExecutor';
import {ActionExecutionResultStatus, type IActionExecutionResult, type IAutomationAction} from './types';

describe('pipelineExecutor', () => {
    const makeMockAction = (type: string, executeResult?: IActionExecutionResult): IAutomationAction => ({
        type,
        paramsSchema: z.object({}), // permissive schema — param validation is not the focus here
        execute: jest.fn().mockResolvedValue(executeResult),
    });

    const makeDepsManager = (actions: IAutomationAction[]): AwilixContainer => {
        const entries = actions.map(a => [`core.domain.automation.actions.${a.type}`, a] as const);
        return {
            registrations: Object.fromEntries(entries.map(([k]) => [k, {}])),
            cradle: Object.fromEntries(entries),
        } as unknown as AwilixContainer;
    };

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
            const actionA = makeMockAction('A');
            const actionB = makeMockAction('B');
            const executor = createPipelineExecutor({'core.depsManager': makeDepsManager([actionA, actionB])});

            await expect(
                executor.executePipeline(createPipelineToExecute([makeStep('A'), makeStep('B')]), mockCtx),
            ).resolves.toBeTruthy();

            expect(actionA.execute).toHaveBeenCalledTimes(1);
            expect(actionB.execute).toHaveBeenCalledTimes(1);
        });

        it('stops pipeline at STOP status and skips subsequent actions', async () => {
            const actionA = makeMockAction('A', {status: ActionExecutionResultStatus.STOP});
            const actionB = makeMockAction('B');
            const executor = createPipelineExecutor({'core.depsManager': makeDepsManager([actionA, actionB])});

            await expect(
                executor.executePipeline(createPipelineToExecute([makeStep('A'), makeStep('B')]), mockCtx),
            ).resolves.toBeTruthy();

            expect(actionA.execute).toHaveBeenCalledTimes(1);
            expect(actionB.execute).not.toHaveBeenCalled();
        });

        it('interrupts pipeline when an action throws, without rethrowing', async () => {
            const actionA = makeMockAction('A');
            (actionA.execute as jest.Mock).mockRejectedValue(new Error('boom'));
            const actionB = makeMockAction('B');
            const executor = createPipelineExecutor({'core.depsManager': makeDepsManager([actionA, actionB])});

            await expect(
                executor.executePipeline(createPipelineToExecute([makeStep('A'), makeStep('B')]), mockCtx),
            ).resolves.toBeFalsy();
            expect(actionB.execute).not.toHaveBeenCalled();
        });

        it('skips unknown action type and continues with remaining actions', async () => {
            const actionA = makeMockAction('A');
            const actionB = makeMockAction('B');
            const executor = createPipelineExecutor({'core.depsManager': makeDepsManager([actionA, actionB])});

            await expect(
                executor.executePipeline(
                    createPipelineToExecute([makeStep('A'), makeStep('UNKNOWN'), makeStep('B')]),
                    mockCtx,
                ),
            ).resolves.toBeTruthy();

            expect(actionA.execute).toHaveBeenCalledTimes(1);
            expect(actionB.execute).toHaveBeenCalledTimes(1);
        });

        it('(temporary here for now) interrupts pipeline when params validation fails, without rethrowing', async () => {
            const actionA: IAutomationAction = {
                type: 'A',
                paramsSchema: z.object({x: z.string()}), // requires x: string
                execute: jest.fn(),
            };
            const actionB = makeMockAction('B');
            const executor = createPipelineExecutor({'core.depsManager': makeDepsManager([actionA, actionB])});

            // Passing empty params — fails the schema
            await expect(
                executor.executePipeline(createPipelineToExecute([makeStep('A', {}), makeStep('B')]), mockCtx),
            ).resolves.toBeFalsy();

            expect(actionA.execute).not.toHaveBeenCalled();
            expect(actionB.execute).not.toHaveBeenCalled();
        });

        it('(temporary here for now) calls optional validateParams after schema validation when defined', async () => {
            const validateParams = jest.fn();
            const action: IAutomationAction = {
                type: 'A',
                paramsSchema: z.object({}),
                validateParams,
                execute: jest.fn(),
            };
            const executor = createPipelineExecutor({'core.depsManager': makeDepsManager([action])});

            await expect(
                executor.executePipeline(createPipelineToExecute([makeStep('A')]), mockCtx),
            ).resolves.toBeTruthy();

            expect(validateParams).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAvailableActions', () => {
        it('returns all actions registered in depsManager', () => {
            const actions = [makeMockAction('A'), makeMockAction('B'), makeMockAction('C')];
            const executor = createPipelineExecutor({'core.depsManager': makeDepsManager(actions)});

            const available = executor.getAvailableActions();

            expect(available).toHaveLength(3);
            expect(available.map(a => a.type)).toEqual(expect.arrayContaining(['A', 'B', 'C']));
        });
    });
});
