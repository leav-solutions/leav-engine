import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IVariableValue} from '../helpers/calculations/calculationVariable';
import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {AttributeTypes} from '../../_types/attribute';
import inheritanceCalculationAction from './inheritanceCalculationAction';

const mockCalculationsVariable = {
    processVariableString: vi.fn(),
};

const mockAttributeDomain: Mockify<IAttributeDomain> = {
    getAttributeProperties: global.__mockPromise({type: 'meh'}),
};

const action = inheritanceCalculationAction({
    'core.domain.helpers.calculationVariable': mockCalculationsVariable,
    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
}).action;

describe('inheritanceCalculationAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCalculationsVariable.processVariableString.mockImplementation(
            async (ctx: IActionsListContext, variable: string): Promise<IVariableValue[]> => [
                {
                    payload: `${variable}Value`,
                    raw_payload: 'testRawValue',
                    recordId: '1',
                    library: 'meh',
                },
            ],
        );
    });
    test('Simply call processVariableString', async () => {
        const ctx: IActionsListContext = {
            attribute: {
                id: 'meh',
                type: AttributeTypes.SIMPLE,
            },
            userId: 'test',
            actionEvent: ActionsListEvents.GET_VALUE,
        };

        const res = await action(
            null,
            {
                Description: 'test',
                Formula: '42',
            },
            ctx,
        );

        expect(res.values[0].payload).toBe('42Value');
        expect((res.values[0] as any).raw_payload).toBe('testRawValue');
    });

    test('No formula', async () => {
        const ctx: IActionsListContext = {
            attribute: {
                id: 'meh',
                type: AttributeTypes.SIMPLE,
            },
            userId: 'test',
            actionEvent: ActionsListEvents.GET_VALUE,
        };
        const res = await action(
            null,
            {
                Description: 'test',
                Formula: '',
            },
            ctx,
        );

        expect(res.values[0].payload).toBe('Value');
    });

    test('Inherit from link', async () => {
        const mockAttributeDomain2: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise({type: AttributeTypes.SIMPLE_LINK, linked_library: 'meh'}),
        };
        const action2 = inheritanceCalculationAction({
            'core.domain.helpers.calculationVariable': mockCalculationsVariable,
            'core.domain.attribute': mockAttributeDomain2 as IAttributeDomain,
        }).action;
        const ctx: IActionsListContext = {
            attribute: {
                id: 'bla',
                type: AttributeTypes.SIMPLE_LINK,
            },
            userId: 'test',
            actionEvent: ActionsListEvents.GET_VALUE,
        };

        const res = await action2(
            null,
            {
                Description: 'test',
                Formula: '',
            },
            ctx,
        );

        const resultValue = res.values[0].payload;

        expect(resultValue).toHaveProperty('id');
        expect(resultValue).toHaveProperty('library');
        expect(resultValue.id).toBe('Value');
        expect(resultValue.library).toBe('meh');
    });

    test('Return origin values along calculation result by default', async () => {
        const ctx: IActionsListContext = {
            attribute: {
                id: 'meh',
                type: AttributeTypes.SIMPLE,
            },
            userId: 'test',
            actionEvent: ActionsListEvents.GET_VALUE,
        };

        const res = await action(
            [
                {
                    payload: 'OriginValue',
                    raw_payload: 'OriginRawValue',
                },
            ],
            {
                Description: 'test',
                Formula: '42',
            },
            ctx,
        );

        expect(res.values[0].payload).toBe('OriginValue');
        expect((res.values[0] as any).raw_payload).toBe('OriginRawValue');
        expect(res.values[1].payload).toBe('42Value');
        expect((res.values[1] as any).raw_payload).toBe('testRawValue');
    });

    test('Return not origin values along calculation result when "Return only calculated value" is true', async () => {
        const ctx: IActionsListContext = {
            attribute: {
                id: 'meh',
                type: AttributeTypes.SIMPLE,
            },
            userId: 'test',
            actionEvent: ActionsListEvents.SAVE_VALUE,
        };

        const res = await action(
            [
                {
                    payload: 'OriginValue',
                    raw_payload: 'OriginRawValue',
                },
            ],
            {
                Description: 'test',
                Formula: '42',
                'Return only calculated value': 'true',
            },
            ctx,
        );

        expect(res.values[0].payload).toBe('42Value');
        expect((res.values[0] as any).raw_payload).toBe('testRawValue');
    });

    describe('Empty inheritance cases', () => {
        beforeEach(() => {
            mockCalculationsVariable.processVariableString.mockImplementation(
                async (ctx: IActionsListContext, variable: string): Promise<IVariableValue[]> => [],
            );
        });

        test('Return origin values for empty inheritance by default', async () => {
            const ctx: IActionsListContext = {
                attribute: {
                    id: 'meh',
                    type: AttributeTypes.SIMPLE,
                },
                userId: 'test',
                actionEvent: ActionsListEvents.GET_VALUE,
            };

            const res = await action(
                [
                    {
                        payload: 'OriginValue',
                        raw_payload: 'OriginRawValue',
                    },
                ],
                {
                    Description: 'test',
                    Formula: '42',
                },
                ctx,
            );

            expect(res.values[0].payload).toBe('OriginValue');
            expect((res.values[0] as any).raw_payload).toBe('OriginRawValue');
        });

        test('Return not values for empty inheritance when "Return only calculated value" is true', async () => {
            const ctx: IActionsListContext = {
                attribute: {
                    id: 'meh',
                    type: AttributeTypes.SIMPLE,
                },
                userId: 'test',
                actionEvent: ActionsListEvents.SAVE_VALUE,
            };

            const res = await action(
                [
                    {
                        payload: 'OriginValue',
                        raw_payload: 'OriginRawValue',
                    },
                ],
                {
                    Description: 'test',
                    Formula: '42',
                    'Return only calculated value': 'true',
                },
                ctx,
            );

            expect(res.values).toHaveLength(0);
        });
    });
});
