import type Joi from 'joi';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {mockAttrSimple} from '../../__tests__/mocks/attribute';
import {mockCtx} from '../../__tests__/mocks/shared';
import actionListDomain, {type IActionsListDomainDeps} from './actionsListDomain';
import {mockTranslator} from '../../__tests__/mocks/translator';
import {type i18n} from 'i18next';
import {type ToAny} from '../../utils/utils';
import {EMPTY_VALUE} from '../../infra/value/valueRepo';
import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';

const depsBase: ToAny<IActionsListDomainDeps> = {
    'core.depsManager': vi.fn(),
    translator: {},
};

describe('handleJoiError', () => {
    test('handleJoiError', async () => {
        const domain = actionListDomain(depsBase);
        const mockError = {
            details: [
                {
                    message: 'boom',
                },
            ],
        };

        const res = domain.handleJoiError({id: 'test', type: AttributeTypes.SIMPLE}, mockError as Joi.ValidationError);
        expect(res).toMatchObject({
            test: {
                msg: 'FORMAT_ERROR',
                vars: {
                    details: 'boom',
                },
            },
        });
    });
});

describe('runActionsList', () => {
    const val = {
        id_value: '999',
        payload: 'test_val',
    };

    const ctx: IActionsListContext = {
        library: 'test_lib',
        attribute: {id: 'test_attr', type: AttributeTypes.SIMPLE},
        lang: 'en',
        defaultLang: 'fr',
        userId: 'test_user',
        actionEvent: ActionsListEvents.GET_VALUE,
    };

    test('Should run a list of actions', async () => {
        const domain = actionListDomain(depsBase);

        const availActions = [
            {
                id: 'validate',
                name: 'validate',
                action: vi.fn().mockImplementation(() => ({
                    values: [{id_value: '999', payload: 'test_val'}],
                    errors: [],
                })),
            },
            {
                id: 'convert',
                name: 'convert',
                action: vi.fn().mockImplementation(() => ({
                    values: [{id_value: '999', payload: 'test_val'}],
                    errors: [],
                })),
            },
        ];

        domain.getAvailableActions = vi.fn().mockReturnValue(availActions);

        const res = await domain.runActionsList(
            [
                {id: 'convert', name: 'Convert', params: [{name: 'firstArg', value: 'test'}], is_system: false},
                {id: 'validate', name: 'Validate', is_system: true},
            ],
            [val],
            ctx,
        );

        expect(res).toEqual([val]);
    });

    test('Should not run a list of actions on empty values', async () => {
        const domain = actionListDomain(depsBase);

        const availActions = [
            {
                id: 'validate',
                name: 'validate',
                action: vi.fn().mockImplementation(() => ({
                    values: [{id_value: '999', payload: 'test_val'}],
                    errors: [],
                })),
            },
            {
                id: 'convert',
                name: 'convert',
                action: vi.fn().mockImplementation(() => ({
                    values: [{id_value: '999', payload: 'test_val'}],
                    errors: [],
                })),
            },
        ];

        domain.getAvailableActions = vi.fn().mockReturnValue(availActions);

        const res = await domain.runActionsList(
            [
                {id: 'convert', name: 'Convert', params: [{name: 'firstArg', value: 'test'}], is_system: false},
                {id: 'validate', name: 'Validate', is_system: true},
            ],
            [val, {payload: EMPTY_VALUE}],
            ctx,
        );

        expect(res).toEqual([val, {payload: EMPTY_VALUE}]);
    });

    test('Should throw if an action is not found', async () => {
        const domain = actionListDomain(depsBase);
        const availActions = [
            {
                id: 'validate',
                name: 'validate',
                action: vi.fn().mockImplementation(() => ({
                    errors: [{errorType: Errors.ERROR, message: 'validation Error', attributeValue: {payload: true}}],
                })),
            },
        ];

        domain.getAvailableActions = vi.fn().mockReturnValue(availActions);

        await expect(
            domain.runActionsList(
                [{id: 'actionNotExists', name: 'Action not exists', params: [], is_system: false}],
                [val],
                ctx,
            ),
        ).rejects.toThrow(/Run action list - action actionNotExists not found/);
    });

    test('Should throw if an action throws', async () => {
        const domain = actionListDomain(depsBase);
        const availActions = [
            {
                id: 'validate',
                name: 'validate',
                action: vi.fn().mockImplementation(() => ({
                    errors: [{errorType: Errors.ERROR, message: 'validation Error', attributeValue: {payload: true}}],
                })),
            },
            {
                id: 'convert',
                name: 'convert',
                action: vi.fn().mockImplementation(() => ({
                    errors: [{errorType: Errors.ERROR, message: 'validation Error', attributeValue: {payload: true}}],
                })),
            },
        ];

        domain.getAvailableActions = vi.fn().mockReturnValue(availActions);

        await expect(
            domain.runActionsList(
                [
                    {id: 'convert', name: 'Convert', params: [{name: 'firstArg', value: 'test'}], is_system: false},
                    {id: 'validate', name: 'validate', is_system: true},
                ],
                [val],
                ctx,
            ),
        ).rejects.toThrow(ValidationError);
    });

    test('Should throw an exception with custom message', async () => {
        const domain = actionListDomain(depsBase);
        const availActions = [
            {
                id: 'validate',
                name: 'validate',
                action: vi.fn().mockImplementation(() => ({
                    errors: [{errorType: Errors.ERROR, message: 'validation Error', attributeValue: {payload: true}}],
                })),
            },
            {
                id: 'convert',
                name: 'convert',
                action: vi.fn().mockImplementation(() => ({
                    errors: [{errorType: Errors.ERROR, message: 'validation Error', attributeValue: {payload: true}}],
                })),
            },
        ];

        domain.getAvailableActions = vi.fn().mockReturnValue(availActions);

        const res = domain.runActionsList(
            [
                {id: 'convert', name: 'Convert', params: [{name: 'firstArg', value: 'test'}], is_system: false},
                {id: 'validate', name: 'validate', is_system: true, error_message: {en: 'test error message'}},
            ],
            [val],
            ctx,
        );

        await expect(res).rejects.toThrow(ValidationError);
        await expect(res).rejects.toHaveProperty('fields.test_attr', 'validation Error: true');
    });

    test('Should throw an exception with custom message from system while a error_message "en" has been set', async () => {
        const textctx: IActionsListContext = {
            ...mockCtx,
            attribute: {...mockAttrSimple, id: 'test_attr'},
            lang: 'fr',
            defaultLang: 'fr',
            actionEvent: ActionsListEvents.GET_VALUE,
        };
        const domain = actionListDomain({...depsBase, translator: mockTranslator as i18n});
        const availActions = [
            {
                id: 'validate',
                name: 'validate',
                action: vi.fn().mockImplementation(() => ({
                    errors: [{errorType: Errors.ERROR, message: 'validation Error', attributeValue: {payload: true}}],
                })),
            },
            {
                id: 'convert',
                name: 'convert',
                action: vi.fn().mockImplementation(() => ({
                    errors: [{errorType: Errors.ERROR, message: 'validation Error', attributeValue: {payload: true}}],
                })),
            },
        ];

        domain.getAvailableActions = vi.fn().mockReturnValue(availActions);

        const res = domain.runActionsList(
            [
                {id: 'convert', name: 'Convert', params: [{name: 'firstArg', value: 'test'}], is_system: false},
                {id: 'validate', name: 'validate', is_system: true, error_message: {en: 'test error message'}},
            ],
            [val],
            textctx,
        );
        await expect(res).rejects.toThrow(ValidationError);
        await expect(res).rejects.toHaveProperty('fields.test_attr', 'validation Error: true');
    });
});
