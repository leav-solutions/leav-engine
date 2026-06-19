import {EventAction} from '@leav/utils';
import {type AutomationRuleEventTopic} from '../../../../../_types/automation';
import {type IQueryInfos} from '../../../../../_types/queryInfos';
import {systemUserId} from '../../../../../_constants/users';
import {ActionExecutionResultStatus, type IAutomationAction} from '../../../../../domain/automation/actions/_types';
import {type JexlExpressionActionParams} from '../../../../../domain/automation/actions/jexlExpressionAction';
import {Errors} from '../../../../../_types/errors';
import ValidationError from '../../../../../errors/ValidationError';
import {getCoreDep} from '../../../integrationTestUtils';
import {type IAutomationPipelineExecutionState} from '../../../../../domain/automation/pipeline/_types';
import {pipelineStepValidation} from '../../../../../domain/automation/pipeline/stepValidation';

describe('jexlExpressionAction', () => {
    let action: IAutomationAction<JexlExpressionActionParams>;
    const ctx: IQueryInfos = {userId: systemUserId};

    const trigger = {
        synchronous: false,
        eventAction: EventAction.RECORD_INIT,
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
        action = getCoreDep<IAutomationAction<JexlExpressionActionParams>>(
            'core.domain.automation.actions.jexlExpression',
        );
    });

    describe('validateParams', () => {
        const makeValidateParams = (expression: string) =>
            pipelineStepValidation<JexlExpressionActionParams>(
                {
                    steps: [{params: {expression}, type: 'jexlExpression'}],
                    trigger,
                },
                0,
            );

        it('resolves for a valid Jexl expression', async () => {
            await expect(action.validateStep?.(makeValidateParams('1 + 1'), ctx)).resolves.toBeUndefined();
        });

        it('resolves for a complex valid expression', async () => {
            await expect(
                action.validateStep?.(makeValidateParams('$.results["step1"] * 2 + 10'), ctx),
            ).resolves.toBeUndefined();
        });

        it('throws ValidationError for an invalid Jexl expression', async () => {
            let caughtError: unknown;
            try {
                await action.validateStep?.(makeValidateParams('1 ++ 1'), ctx);
            } catch (err) {
                caughtError = err;
            }
            expect(caughtError).toBeInstanceOf(ValidationError);
            expect((caughtError as ValidationError<any>).fields!.expression).toMatchObject({
                msg: Errors.INVALID_JEXL_EXPRESSION,
            });
        });
    });

    describe('execute — without record', () => {
        it('evaluates a simple arithmetic expression', async () => {
            const result = await action.execute({expression: '2 + 3'}, baseState, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 5});
        });

        it('returns a string result', async () => {
            const result = await action.execute({expression: '"hello" + " world"'}, baseState, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 'hello world'});
        });

        it('accesses results from previous pipeline steps', async () => {
            const stateWithResults: IAutomationPipelineExecutionState = {
                ...baseState,
                results: {previousStep: 10},
            };
            const result = await action.execute({expression: '$.results.previousStep * 3'}, stateWithResults, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 30});
        });

        it('always returns status CONTINUE', async () => {
            const result = await action.execute({expression: 'true'}, baseState, ctx);
            expect(result).toMatchObject({status: ActionExecutionResultStatus.CONTINUE});
        });
    });

    describe('execute — with record in eventTopic', () => {
        const record = {
            id: 'rec_001',
            libraryId: 'products',
            // simple attributes, but prefer use 'getValues' functions/transform to not be attribute type dependent
            price: 42,
            label: 'Widget',
        } as AutomationRuleEventTopic['record'];

        const stateWithRecord: IAutomationPipelineExecutionState = {
            ...baseState,
            trigger: {
                ...baseState.trigger,
                eventTopic: {record},
            },
        };

        it('exposes currentRecord.id in the expression', async () => {
            const result = await action.execute({expression: '$.currentRecord.id'}, stateWithRecord, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 'rec_001'});
        });

        it('exposes currentRecord.library in the expression', async () => {
            const result = await action.execute({expression: '$.currentRecord.library'}, stateWithRecord, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 'products'});
        });

        it('exposes custom simple attributes from the record', async () => {
            const result = await action.execute({expression: '$.currentRecord.price * 2'}, stateWithRecord, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 84});
        });

        it('combines currentRecord fields with previous pipeline results', async () => {
            const stateWithBoth: IAutomationPipelineExecutionState = {
                ...stateWithRecord,
                results: {discount: 10},
            };
            const result = await action.execute(
                {expression: '$.currentRecord.price - $.results.discount'},
                stateWithBoth,
                ctx,
            );
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 32});
        });

        it('builds a string from currentRecord fields', async () => {
            const result = await action.execute(
                {expression: '$.currentRecord.label + " (" + $.currentRecord.library + ")"'},
                stateWithRecord,
                ctx,
            );
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 'Widget (products)'});
        });
    });
});
