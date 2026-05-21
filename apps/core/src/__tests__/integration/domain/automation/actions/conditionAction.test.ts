import {type AutomationRuleEventTopic, SyncAutomationRuleEventAction} from '../../../../../_types/automation';
import {type IQueryInfos} from '../../../../../_types/queryInfos';
import {systemUserId} from '../../../../../_constants/users';
import {ActionExecutionResultStatus, type IAutomationAction} from '../../../../../domain/automation/actions/_types';
import {type ConditionActionParams} from '../../../../../domain/automation/actions/conditionAction';
import {Errors} from '../../../../../_types/errors';
import ValidationError from '../../../../../errors/ValidationError';
import {getCoreDep} from '../../../integrationTestUtils';
import {type IAutomationPipelineExecutionState} from '../../../../../domain/automation/pipeline/_types';
import {pipelineStepValidation} from '../../../../../domain/automation/pipeline/stepValidation';

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

    describe('validateStep', () => {
        const makeValidateParams = (expression: string) =>
            pipelineStepValidation<ConditionActionParams>(
                {
                    steps: [{params: {expression}, type: 'condition'}],
                    trigger,
                },
                0,
            );

        it('resolves for a valid Jexl expression', async () => {
            await expect(action.validateStep?.(makeValidateParams('1 == 1'), ctx)).resolves.toBeUndefined();
        });

        it('throws ValidationError for an invalid Jexl expression', async () => {
            const error = await action.validateStep?.(makeValidateParams('1 ++ 1'), ctx).catch(err => err);

            expect(error).toBeInstanceOf(ValidationError);
            expect((error as ValidationError<any>).fields!.formula).toMatchObject({
                msg: Errors.INVALID_JEXL_EXPRESSION,
            });
        });
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

            const result = await action.execute({expression: '$.results.previousStep == 42'}, stateWithResults, ctx);
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
            const result = await action.execute({expression: '$.results.previousStep == 1'}, stateWithResults, ctx);
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
        const record = {
            id: 'rec_001',
            libraryId: 'library_test',
            price: 42,
        } as AutomationRuleEventTopic['record'];

        const stateWithRecord: IAutomationPipelineExecutionState = {
            ...baseState,
            trigger: {
                ...baseState.trigger,
                eventTopic: {record},
            },
        };

        it('returns CONTINUE when a record field satisfies the condition', async () => {
            const result = await action.execute({expression: '$.currentRecord.price > 10'}, stateWithRecord, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: true});
        });

        it('returns STOP when a record field does not satisfy the condition', async () => {
            const result = await action.execute({expression: '$.currentRecord.price > 100'}, stateWithRecord, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.STOP, reason: 'condition returned false'});
        });

        it('evaluates an expression combining currentRecord fields and previous step results', async () => {
            const stateWithBoth: IAutomationPipelineExecutionState = {
                ...stateWithRecord,
                results: {threshold: 50},
            };

            const result = await action.execute(
                {expression: '$.currentRecord.price < $.results.threshold'},
                stateWithBoth,
                ctx,
            );
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: true});
        });
    });
});
