// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SyncAutomationRuleEventAction} from '../../../../../_types/automation';
import {type IQueryInfos} from '../../../../../_types/queryInfos';
import {systemUserId} from '../../../../../_constants/users';
import {ActionExecutionResultStatus, type IAutomationAction} from '../../../../../domain/automation/actions/_types';
import {type ConditionActionParams} from '../../../../../domain/automation/actions/conditionAction';
import {getCoreDep} from '../../../integrationTestUtils';
import {type IRecord} from '../../../../../_types/record';
import {type IAutomationPipelineExecutionState} from '../../../../../domain/automation/pipeline/_types';

describe('conditionAction', () => {
    let action: IAutomationAction<ConditionActionParams>;
    const ctx: IQueryInfos = {userId: systemUserId};

    const trigger = {
        synchronous: false as const,
        eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
        eventTopic: {} as any,
    };

    const baseState: IAutomationPipelineExecutionState = {
        trigger,
        results: {},
        stepIndex: 0,
        lastResult: undefined,
        startDateMs: Date.now(),
    };

    beforeAll(() => {
        action = getCoreDep<IAutomationAction<ConditionActionParams>>('core.domain.automation.actions.condition');
    });

    describe('execute — returns CONTINUE when expression is truthy', () => {
        it('returns CONTINUE with result true for literal true expression', async () => {
            const result = await action.execute({expression: 'true'}, baseState, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: true});
        });

        it('returns CONTINUE for a an equality comparison', async () => {
            const result = await action.execute({expression: '1 == 1'}, baseState, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: true});
        });

        it('returns CONTINUE when a previous step result satisfies the expression', async () => {
            const stateWithResults: IAutomationPipelineExecutionState = {
                ...baseState,
                results: {previousStep: 42},
            };

            const result = await action.execute({expression: 'results.previousStep == 42'}, stateWithResults, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: true});
        });
    });

    describe('execute — returns STOP when expression is falsy', () => {
        it('returns STOP with reason for literal false expression', async () => {
            const result = await action.execute({expression: 'false'}, baseState, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.STOP, reason: 'condition returned false'});
        });

        it('returns STOP for a boolean-yielding inequality expression', async () => {
            const result = await action.execute({expression: '1 == 2'}, baseState, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.STOP, reason: 'condition returned false'});
        });

        it('returns STOP when a previous step result does not satisfy the expression', async () => {
            const stateWithResults: IAutomationPipelineExecutionState = {
                ...baseState,
                results: {previousStep: 0},
            };
            const result = await action.execute({expression: 'results.previousStep == 1'}, stateWithResults, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.STOP, reason: 'condition returned false'});
        });
    });

    describe('execute — throws when expression does not evaluate to a boolean', () => {
        it('throws for a numeric expression', async () => {
            await expect(action.execute({expression: '42'}, baseState, ctx)).rejects.toThrow(
                'Condition expression must evaluate to a boolean.',
            );
        });

        it('throws for a string expression', async () => {
            await expect(action.execute({expression: '"hello"'}, baseState, ctx)).rejects.toThrow(
                'Condition expression must evaluate to a boolean.',
            );
        });
    });

    describe('execute — with record in eventTopic', () => {
        const record: IRecord = {
            id: 'rec_001',
            library: 'library_test',
            price: 42,
        };

        const stateWithRecord: IAutomationPipelineExecutionState = {
            ...baseState,
            trigger: {
                ...baseState.trigger,
                eventTopic: {record} as any,
            },
        };

        it('returns CONTINUE when a record field satisfies the condition', async () => {
            const result = await action.execute({expression: 'currentRecord.price > 10'}, stateWithRecord, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: true});
        });

        it('returns STOP when a record field does not satisfy the condition', async () => {
            const result = await action.execute({expression: 'currentRecord.price > 100'}, stateWithRecord, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.STOP, reason: 'condition returned false'});
        });

        it('evaluates an expression combining currentRecord fields and previous step results', async () => {
            const stateWithBoth: IAutomationPipelineExecutionState = {
                ...stateWithRecord,
                results: {threshold: 50},
            };

            const result = await action.execute(
                {expression: 'currentRecord.price < results.threshold'},
                stateWithBoth,
                ctx,
            );
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: true});
        });
    });
});
