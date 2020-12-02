// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as Joi from '@hapi/joi';
import {IUtils} from 'utils/utils';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import actionListDomain from './actionsListDomain';

describe('handleJoiError', () => {
    test('handleJoiError', async () => {
        const domain = actionListDomain();
        const mockError = {
            details: [
                {
                    message: 'boom'
                }
            ]
        };

        const res = domain.handleJoiError({id: 'test', type: AttributeTypes.SIMPLE}, mockError as Joi.ValidationError);
        expect(res).toMatchObject({
            test: {
                msg: 'FORMAT_ERROR',
                vars: {
                    details: 'boom'
                }
            }
        });
    });
});

describe('runActionsList', () => {
    const val = {
        id_value: '999',
        value: 'test_val'
    };

    const ctx = {
        attribute: {id: 'test_attr'}
    };

    test('Should run a list of actions', async () => {
        const mockUtils: Mockify<IUtils> = {
            pipe: jest.fn().mockReturnValue(global.__mockPromise('test_val'))
        };

        const domain = actionListDomain({'core.utils': mockUtils as IUtils});
        const availActions = [
            {
                name: 'validate',
                action: jest.fn()
            },
            {
                name: 'convert',
                action: jest.fn()
            }
        ];

        domain.getAvailableActions = jest.fn().mockReturnValue(availActions);

        const res = await domain.runActionsList(
            [
                {id: 'convert', name: 'Convert', params: [{name: 'firstArg', value: 'test'}], is_system: false},
                {id: 'validate', name: 'Validate', is_system: true}
            ],
            val,
            ctx
        );

        expect(res).toEqual(val);
        expect(mockUtils.pipe.mock.calls.length).toBe(1);
        expect(mockUtils.pipe.mock.calls[0].length).toBe(2);
        expect(typeof mockUtils.pipe.mock.calls[0][0]).toBe('function');
        expect(typeof mockUtils.pipe.mock.calls[0][1]).toBe('function');
    });

    test('Should throw if an action throws', async () => {
        const mockUtils: Mockify<IUtils> = {
            pipe: jest.fn().mockReturnValue(
                jest.fn().mockImplementation(() => {
                    throw new ValidationError({test_attr: Errors.ERROR});
                })
            )
        };

        const domain = actionListDomain({'core.utils': mockUtils as IUtils});
        const availActions = [
            {
                name: 'validate',
                action: jest.fn().mockImplementation(() => {
                    throw new ValidationError({test_attr: Errors.ERROR});
                })
            },
            {
                name: 'convert',
                action: jest.fn()
            }
        ];

        domain.getAvailableActions = jest.fn().mockReturnValue(availActions);

        await expect(
            domain.runActionsList(
                [
                    {id: 'convert', name: 'Convert', params: [{name: 'firstArg', value: 'test'}], is_system: false},
                    {id: 'validate', name: 'validate', is_system: true}
                ],
                val,
                ctx
            )
        ).rejects.toThrow(ValidationError);
    });
});
