// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import bcrypt from 'bcryptjs';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {IApiKeyRepo} from 'infra/apiKey/apiKeyRepo';
import {IUtils, ToAny} from 'utils/utils';
import {IApiKey} from '_types/apiKey';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AdminPermissionsActions} from '../../_types/permissions';
import {mockApiKey} from '../../__tests__/mocks/apiKey';
import {mockCtx} from '../../__tests__/mocks/shared';
import apiKeyDomain, {IApiKeyDomainDeps} from './apiKeyDomain';

const depsBase: ToAny<IApiKeyDomainDeps> = {
    'core.domain.permission.admin': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.infra.apiKey': jest.fn(),
    'core.utils': jest.fn(),
    translator: {}
};

describe('apiKeyDomain', () => {
    const mockUtils: Mockify<IUtils> = {
        generateExplicitValidationError: jest.fn().mockReturnValue(new ValidationError({}, ''))
    };

    const mockAdminPermissionDomain: Mockify<IAdminPermissionDomain> = {
        getAdminPermission: global.__mockPromise(true)
    };

    const mockAdminPermissionDomainForbidden: Mockify<IAdminPermissionDomain> = {
        getAdminPermission: global.__mockPromise(false)
    };

    const mockEventsManager: Mockify<IEventsManagerDomain> = {
        sendDatabaseEvent: global.__mockPromise()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getApiKeys', () => {
        test('Return list of api keys', async () => {
            const mockRepo: Mockify<IApiKeyRepo> = {
                getApiKeys: global.__mockPromise({
                    totalCount: 2,
                    list: [
                        {...mockApiKey, id: 'key1'},
                        {...mockApiKey, id: 'key2'}
                    ]
                })
            };

            const domain = apiKeyDomain({
                ...depsBase,
                'core.infra.apiKey': mockRepo as IApiKeyRepo
            });

            const keys = await domain.getApiKeys({ctx: mockCtx});

            expect(mockRepo.getApiKeys?.mock.calls.length).toBe(1);
            expect(mockRepo.getApiKeys?.mock.calls[0][0]).toMatchObject({ctx: mockCtx});

            expect(keys.list).toHaveLength(2);
            expect(keys.list[0].id).toBe('key1');
            expect(keys.list[0].key).toBe(null);
            expect(keys.list[1].id).toBe('key2');
            expect(keys.list[1].key).toBe(null);
        });
    });

    describe('getApiKeyProperties', () => {
        test('Return properties for given key id', async () => {
            const mockRepo: Mockify<IApiKeyRepo> = {
                getApiKeys: global.__mockPromise({
                    totalCount: 1,
                    list: [{...mockApiKey}]
                })
            };

            const domain = apiKeyDomain({
                ...depsBase,
                'core.infra.apiKey': mockRepo as IApiKeyRepo
            });

            const keyProps = await domain.getApiKeyProperties({id: mockApiKey.id, ctx: mockCtx});

            expect(mockRepo.getApiKeys?.mock.calls.length).toBe(1);

            expect(keyProps).toEqual({...mockApiKey, key: null});
        });

        test('Should throw if unknown key', async () => {
            const mockRepo: Mockify<IApiKeyRepo> = {
                getApiKeys: global.__mockPromise({
                    totalCount: 0,
                    list: []
                })
            };

            const domain = apiKeyDomain({
                ...depsBase,
                'core.infra.apiKey': mockRepo as IApiKeyRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(async () => domain.getApiKeyProperties({id: mockApiKey.id, ctx: mockCtx})).rejects.toThrow(
                ValidationError
            );
        });
    });

    describe('saveApiKey', () => {
        describe('Creation', () => {
            test('Should create a new key', async () => {
                const mockRepo: Mockify<IApiKeyRepo> = {
                    getApiKeys: global.__mockPromise({totalCount: 0, list: []}),
                    createApiKey: global.__mockPromise({...mockApiKey}),
                    updateApiKey: jest.fn()
                };

                const domain = apiKeyDomain({
                    ...depsBase,
                    'core.infra.apiKey': mockRepo as IApiKeyRepo,
                    'core.utils': mockUtils as IUtils,
                    'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
                });

                const keyToSave: IApiKey = {
                    label: 'test',
                    userId: '42',
                    expiresAt: 0
                };
                const savedKey = await domain.saveApiKey({apiKey: keyToSave, ctx: mockCtx});

                expect(mockRepo.createApiKey).toBeCalled();
                const createCallKeyData = mockRepo.createApiKey?.mock.calls[0][0].keyData;
                expect(createCallKeyData.key).toBeDefined();
                expect(createCallKeyData.createdAt).toBeDefined();
                expect(createCallKeyData.createdBy).toBe(mockCtx.userId);
                expect(createCallKeyData.modifiedAt).toBeDefined();
                expect(createCallKeyData.modifiedBy).toBe(mockCtx.userId);

                expect(mockRepo.updateApiKey).not.toBeCalled();
                expect(savedKey.key).toBeDefined();
            });

            test('Should throw if not allowed', async () => {
                const mockRepo: Mockify<IApiKeyRepo> = {
                    getApiKeys: global.__mockPromise({totalCount: 0, list: []}),
                    createApiKey: global.__mockPromise({...mockApiKey}),
                    updateApiKey: jest.fn()
                };

                const domain = apiKeyDomain({
                    ...depsBase,
                    'core.infra.apiKey': mockRepo as IApiKeyRepo,
                    'core.utils': mockUtils as IUtils,
                    'core.domain.permission.admin': mockAdminPermissionDomainForbidden as IAdminPermissionDomain,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
                });

                const keyToSave: IApiKey = {
                    label: 'test',
                    userId: '42',
                    expiresAt: 0
                };
                await expect(() => domain.saveApiKey({apiKey: keyToSave, ctx: mockCtx})).rejects.toThrow(
                    PermissionError
                );

                expect(mockAdminPermissionDomainForbidden.getAdminPermission).toBeCalled();
                expect(mockAdminPermissionDomainForbidden.getAdminPermission?.mock.calls[0][0].action).toBe(
                    AdminPermissionsActions.CREATE_API_KEY
                );
            });
        });

        describe('Update', () => {
            test('Should update an existing key', async () => {
                const mockRepo: Mockify<IApiKeyRepo> = {
                    getApiKeys: global.__mockPromise({totalCount: 1, list: [{...mockApiKey}]}),
                    createApiKey: jest.fn(),
                    updateApiKey: global.__mockPromise({...mockApiKey})
                };

                const domain = apiKeyDomain({
                    ...depsBase,
                    'core.infra.apiKey': mockRepo as IApiKeyRepo,
                    'core.utils': mockUtils as IUtils,
                    'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
                });
                domain.getApiKeyProperties = global.__mockPromise({...mockApiKey});

                const keyToSave: IApiKey = {
                    ...mockApiKey,
                    key: 'trying-to-hack-the-key-sshhh'
                };
                const savedKey = await domain.saveApiKey({apiKey: keyToSave, ctx: mockCtx});

                expect(mockRepo.updateApiKey).toBeCalled();
                const updateCallKeyData = mockRepo.updateApiKey?.mock.calls[0][0].keyData;
                expect(updateCallKeyData.key).toBeUndefined(); // User can't change the key

                expect(updateCallKeyData.modifiedAt).toBeDefined();
                expect(updateCallKeyData.modifiedBy).toBe(mockCtx.userId);

                expect(mockRepo.createApiKey).not.toBeCalled();
                expect(savedKey).toEqual({...mockApiKey, key: null});
            });

            test('Should throw if unknown key', async () => {
                const mockRepo: Mockify<IApiKeyRepo> = {
                    getApiKeys: global.__mockPromise({
                        totalCount: 0,
                        list: []
                    })
                };

                const domain = apiKeyDomain({
                    ...depsBase,
                    'core.infra.apiKey': mockRepo as IApiKeyRepo,
                    'core.utils': mockUtils as IUtils,
                    'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
                });
                domain.getApiKeyProperties = jest.fn().mockRejectedValue(new ValidationError({}));

                await expect(async () => domain.saveApiKey({apiKey: {...mockApiKey}, ctx: mockCtx})).rejects.toThrow(
                    ValidationError
                );
            });

            test('Should throw if not allowed', async () => {
                const mockRepo: Mockify<IApiKeyRepo> = {
                    getApiKeys: global.__mockPromise({totalCount: 1, list: [{...mockApiKey}]}),
                    createApiKey: jest.fn(),
                    updateApiKey: global.__mockPromise({...mockApiKey})
                };

                const domain = apiKeyDomain({
                    ...depsBase,
                    'core.infra.apiKey': mockRepo as IApiKeyRepo,
                    'core.utils': mockUtils as IUtils,
                    'core.domain.permission.admin': mockAdminPermissionDomainForbidden as IAdminPermissionDomain,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
                });
                domain.getApiKeyProperties = global.__mockPromise({...mockApiKey});

                const keyToSave: IApiKey = {...mockApiKey};
                await expect(() => domain.saveApiKey({apiKey: keyToSave, ctx: mockCtx})).rejects.toThrow(
                    PermissionError
                );

                expect(mockAdminPermissionDomainForbidden.getAdminPermission).toBeCalled();
                expect(mockAdminPermissionDomainForbidden.getAdminPermission?.mock.calls[0][0].action).toBe(
                    AdminPermissionsActions.EDIT_API_KEY
                );
            });
        });
    });

    describe('deleteApiKey', () => {
        test('Should delete a key', async () => {
            const mockRepo: Mockify<IApiKeyRepo> = {
                getApiKeys: global.__mockPromise({totalCount: 1, list: [{...mockApiKey}]}),
                deleteApiKey: global.__mockPromise({...mockApiKey})
            };

            const domain = apiKeyDomain({
                ...depsBase,
                'core.infra.apiKey': mockRepo as IApiKeyRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
            });

            const deletedKey = await domain.deleteApiKey({id: mockApiKey.id, ctx: mockCtx});

            expect(mockRepo.deleteApiKey).toBeCalled();
            expect(deletedKey).toEqual({...mockApiKey, key: null});
        });

        test('Should throw if unknown key', async () => {
            const mockRepo: Mockify<IApiKeyRepo> = {
                getApiKeys: global.__mockPromise({
                    totalCount: 0,
                    list: []
                })
            };

            const domain = apiKeyDomain({
                ...depsBase,
                'core.infra.apiKey': mockRepo as IApiKeyRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
            });
            domain.getApiKeyProperties = jest.fn().mockRejectedValue(new ValidationError({}));

            await expect(async () => domain.deleteApiKey({id: mockApiKey.id, ctx: mockCtx})).rejects.toThrow(
                ValidationError
            );
        });

        test('Should throw if not allowed to delete', async () => {
            const mockRepo: Mockify<IApiKeyRepo> = {
                getApiKeys: global.__mockPromise({totalCount: 1, list: [{...mockApiKey}]}),
                deleteApiKey: global.__mockPromise({...mockApiKey})
            };

            const domain = apiKeyDomain({
                ...depsBase,
                'core.infra.apiKey': mockRepo as IApiKeyRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.permission.admin': mockAdminPermissionDomainForbidden as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
            });

            await expect(() => domain.deleteApiKey({id: mockApiKey.id, ctx: mockCtx})).rejects.toThrow(PermissionError);

            expect(mockAdminPermissionDomainForbidden.getAdminPermission).toBeCalled();
            expect(mockAdminPermissionDomainForbidden.getAdminPermission?.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.DELETE_API_KEY
            );
        });
    });

    describe('getApiKeyByKey', () => {
        test('Return API key for given key', async () => {
            const bcryptSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

            const domain = apiKeyDomain(depsBase);
            domain.getApiKeyProperties = global.__mockPromise({...mockApiKey});

            const apiKey = await domain.validateApiKey({apiKey: mockApiKey.key, ctx: mockCtx});

            expect(apiKey).toEqual(mockApiKey);

            bcryptSpy.mockRestore();
        });
    });
});
