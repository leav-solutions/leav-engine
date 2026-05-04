// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SyncAutomationRuleEventAction} from '../../../../../_types/automation';
import {type IQueryInfos} from '../../../../../_types/queryInfos';
import {systemUserId} from '../../../../../_constants/users';
import {ActionExecutionResultStatus, type IAutomationAction} from '../../../../../domain/automation/actions/_types';
import {type JexlCalculationActionParams} from '../../../../../domain/automation/actions/jexlCalculationAutomationAction';
import {Errors} from '../../../../../_types/errors';
import ValidationError from '../../../../../errors/ValidationError';
import {getCoreDep} from '../../../integrationTestUtils';
import {type IRecord} from '../../../../../_types/record';
import {type IAutomationPipelineExecutionState} from '../../../../../domain/automation/pipeline/_types';
import {pipelineStepValidation} from '../../../../../domain/automation/pipeline/stepValidation';

describe('jexlCalculationAutomationAction', () => {
    let action: IAutomationAction<JexlCalculationActionParams>;
    const ctx: IQueryInfos = {userId: systemUserId};

    const trigger = {
        synchronous: false,
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
        action = getCoreDep<IAutomationAction<JexlCalculationActionParams>>(
            'core.domain.automation.actions.jexlCalculation',
        );
    });

    describe('validateParams', () => {
        const makeValidateParams = (formula: string) =>
            pipelineStepValidation<JexlCalculationActionParams>(
                {
                    steps: [{params: {formula}, type: 'jexlCalculation'}],
                    trigger,
                },
                0,
            );

        it('resolves for a valid Jexl expression', async () => {
            await expect(action.validateStep?.(makeValidateParams('1 + 1'), ctx)).resolves.toBeUndefined();
        });

        it('resolves for a complex valid expression', async () => {
            await expect(
                action.validateStep?.(makeValidateParams('results["step1"] * 2 + 10'), ctx),
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
            expect((caughtError as ValidationError<any>).fields!.formula).toMatchObject({
                msg: Errors.INVALID_JEXL_EXPRESSION,
            });
        });
    });

    describe('execute — without record', () => {
        it('evaluates a simple arithmetic expression', async () => {
            const result = await action.execute({formula: '2 + 3'}, baseState, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 5});
        });

        it('returns a string result', async () => {
            const result = await action.execute({formula: '"hello" + " world"'}, baseState, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 'hello world'});
        });

        it('accesses results from previous pipeline steps', async () => {
            const stateWithResults: IAutomationPipelineExecutionState = {
                ...baseState,
                results: {previousStep: 10},
            };
            const result = await action.execute({formula: 'results.previousStep * 3'}, stateWithResults, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 30});
        });

        it('always returns status CONTINUE', async () => {
            const result = await action.execute({formula: 'true'}, baseState, ctx);
            expect(result).toMatchObject({status: ActionExecutionResultStatus.CONTINUE});
        });
    });

    describe('execute — with record in eventTopic', () => {
        const record: IRecord = {
            id: 'rec_001',
            library: 'products',
            // simple attributes, but prefer use 'getValues' functions/transform to not be attribute type dependent
            price: 42,
            label: 'Widget',
        };

        const stateWithRecord: IAutomationPipelineExecutionState = {
            ...baseState,
            trigger: {
                ...baseState.trigger,
                eventTopic: {record} as any,
            },
        };

        it('exposes currentRecord.id in the formula', async () => {
            const result = await action.execute({formula: 'currentRecord.id'}, stateWithRecord, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 'rec_001'});
        });

        it('exposes currentRecord.library in the formula', async () => {
            const result = await action.execute({formula: 'currentRecord.library'}, stateWithRecord, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 'products'});
        });

        it('exposes custom simple attributes from the record', async () => {
            const result = await action.execute({formula: 'currentRecord.price * 2'}, stateWithRecord, ctx);
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 84});
        });

        it('combines currentRecord fields with previous pipeline results', async () => {
            const stateWithBoth: IAutomationPipelineExecutionState = {
                ...stateWithRecord,
                results: {discount: 10},
            };
            const result = await action.execute(
                {formula: 'currentRecord.price - results.discount'},
                stateWithBoth,
                ctx,
            );
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 32});
        });

        it('builds a string from currentRecord fields', async () => {
            const result = await action.execute(
                {formula: 'currentRecord.label + " (" + currentRecord.library + ")"'},
                stateWithRecord,
                ctx,
            );
            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE, result: 'Widget (products)'});
        });
    });
});
