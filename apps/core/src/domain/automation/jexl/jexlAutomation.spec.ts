import {EventAction} from '@leav/utils';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IJexlDomain} from '../../jexl/jexlDomain';
import {type IAutomationPipelineExecutionState} from '../pipeline/_types';
import jexlAutomation from './jexlAutomation';

const mockCtx: IQueryInfos = {userId: '1', queryId: 'jexlAutomation.spec'};

const buildJexlAutomation = () => {
    const jexlDomain: Mockify<IJexlDomain> = {
        eval: vi.fn(),
        validate: vi.fn(),
        buildRootContext: vi.fn().mockImplementation((data, ctx) => ({__type: 'ROOT', ctx, ...data})),
        buildRecordContext: vi.fn().mockImplementation((record, ctx) => ({__type: 'RECORD', ctx, ...record})),
        buildTreeNodeContext: vi.fn(),
        buildValuesContext: vi.fn(),
    };

    return {
        automation: jexlAutomation({'core.domain.jexl': jexlDomain as IJexlDomain}),
        jexlDomain,
    };
};

const buildExecutionState = (
    overrides: Partial<IAutomationPipelineExecutionState> = {},
): IAutomationPipelineExecutionState => ({
    trigger: {
        synchronous: true,
        eventAction: EventAction.RECORD_INIT,
    },
    results: {},
    startDateMs: 0,
    stepIndex: 0,
    ...overrides,
});

describe('jexlAutomation.buildAutomationContext', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('without trigger.eventTopic.record', () => {
        it('omits currentRecord when eventTopic is an empty object', () => {
            const {automation, jexlDomain} = buildJexlAutomation();
            const state = buildExecutionState({
                trigger: {synchronous: false, eventAction: EventAction.RECORD_INIT, eventTopic: {}},
            });

            const context = automation.buildAutomationContext(state, mockCtx);

            expect(context).not.toHaveProperty('currentRecord');
            expect(jexlDomain.buildRecordContext).not.toHaveBeenCalled();
        });

        it('omits currentRecord when eventTopic carries other fields but no record', () => {
            const {automation, jexlDomain} = buildJexlAutomation();
            const state = buildExecutionState({
                trigger: {
                    synchronous: false,
                    eventAction: EventAction.VALUE_SAVE,
                    eventTopic: {library: 'products', attribute: 'color'},
                },
            });

            const context = automation.buildAutomationContext(state, mockCtx);

            expect(context).not.toHaveProperty('currentRecord');
            expect(jexlDomain.buildRecordContext).not.toHaveBeenCalled();
        });
    });

    describe('with trigger.eventTopic.record', () => {
        it('injects currentRecord built via jexlDomain.buildRecordContext', () => {
            const {automation, jexlDomain} = buildJexlAutomation();
            const state = buildExecutionState({
                trigger: {
                    synchronous: true,
                    eventAction: EventAction.RECORD_INIT,
                    eventTopic: {library: 'products', record: {id: '42', libraryId: 'products'}},
                },
            });

            const context = automation.buildAutomationContext(state, mockCtx);

            expect(jexlDomain.buildRecordContext).toHaveBeenCalledTimes(1);
            expect(context).toHaveProperty('currentRecord');
            expect((context as any).currentRecord).toMatchObject({__type: 'RECORD', id: '42'});
        });

        it('maps topic record.libraryId to record.library when building the record context', () => {
            const {automation, jexlDomain} = buildJexlAutomation();
            const state = buildExecutionState({
                trigger: {
                    synchronous: true,
                    eventAction: EventAction.RECORD_INIT,
                    eventTopic: {record: {id: '42', libraryId: 'products'}},
                },
            });

            automation.buildAutomationContext(state, mockCtx);

            expect(jexlDomain.buildRecordContext).toHaveBeenCalledWith({id: '42', library: 'products'}, mockCtx);
        });

        it('maps topic record keep other attributes to simplify action integration test', () => {
            const {automation, jexlDomain} = buildJexlAutomation();
            const state = buildExecutionState({
                trigger: {
                    synchronous: true,
                    eventAction: EventAction.RECORD_INIT,
                    eventTopic: {record: {id: '42', libraryId: 'products', otherAttr: 'value'} as any},
                },
            });

            automation.buildAutomationContext(state, mockCtx);

            expect(jexlDomain.buildRecordContext).toHaveBeenCalledWith(
                {id: '42', library: 'products', otherAttr: 'value'},
                mockCtx,
            );
        });
    });

    it('passes executionState.results through into the root context', () => {
        const {automation} = buildJexlAutomation();
        const results = {step0: 'value0', step1: {nested: true}};
        const state = buildExecutionState({results});

        const context = automation.buildAutomationContext(state, mockCtx);

        expect((context as any).results).toEqual(results);
    });
});
