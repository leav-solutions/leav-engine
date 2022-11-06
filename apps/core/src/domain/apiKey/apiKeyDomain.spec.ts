// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IApiKeyRepo} from 'infra/apiKey/apiKeyRepo';
import {IUtils} from 'utils/utils';
import {IApiKey} from '_types/apiKey';
import ValidationError from '../../errors/ValidationError';
import {mockApiKey} from '../../__tests__/mocks/apiKey';
import {mockCtx} from '../../__tests__/mocks/shared';
import apiKeyDomain from './apiKeyDomain';

describe('apiKeyDomain', () => {
    const mockUtils: Mockify<IUtils> = {
        generateExplicitValidationError: jest.fn().mockReturnValue(new ValidationError({}, ''))
    };

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
                'core.infra.apiKey': mockRepo as IApiKeyRepo
            });

            const keys = await domain.getApiKeys({ctx: mockCtx});

            expect(mockRepo.getApiKeys.mock.calls.length).toBe(1);
            expect(mockRepo.getApiKeys.mock.calls[0][0]).toMatchObject({ctx: mockCtx});

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
                'core.infra.apiKey': mockRepo as IApiKeyRepo
            });

            const keyProps = await domain.getApiKeyProperties({id: mockApiKey.id, ctx: mockCtx});

            expect(mockRepo.getApiKeys.mock.calls.length).toBe(1);

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
                    'core.infra.apiKey': mockRepo as IApiKeyRepo,
                    'core.utils': mockUtils as IUtils
                });

                const keyToSave: IApiKey = {
                    label: 'test',
                    userId: '42',
                    expiresAt: null
                };
                const savedKey = await domain.saveApiKey({apiKey: keyToSave, ctx: mockCtx});

                expect(mockRepo.createApiKey).toBeCalled();
                const createCallKeyData = mockRepo.createApiKey.mock.calls[0][0].keyData;
                expect(createCallKeyData.key).toBeDefined();
                expect(createCallKeyData.created_at).toBeDefined();
                expect(createCallKeyData.created_by).toBe(mockCtx.userId);
                expect(createCallKeyData.modified_at).toBeDefined();
                expect(createCallKeyData.modified_by).toBe(mockCtx.userId);

                expect(mockRepo.updateApiKey).not.toBeCalled();
                expect(savedKey.key).toBeDefined();
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
                    'core.infra.apiKey': mockRepo as IApiKeyRepo,
                    'core.utils': mockUtils as IUtils
                });
                domain.getApiKeyProperties = global.__mockPromise({...mockApiKey});

                const keyToSave: IApiKey = {
                    ...mockApiKey,
                    key: 'trying-to-hack-the-key-sshhh'
                };
                const savedKey = await domain.saveApiKey({apiKey: keyToSave, ctx: mockCtx});

                expect(mockRepo.updateApiKey).toBeCalled();
                const updateCallKeyData = mockRepo.updateApiKey.mock.calls[0][0].keyData;
                expect(updateCallKeyData.key).toBeUndefined(); // User can't change the key

                expect(updateCallKeyData.modified_at).toBeDefined();
                expect(updateCallKeyData.modified_by).toBe(mockCtx.userId);

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
                    'core.infra.apiKey': mockRepo as IApiKeyRepo,
                    'core.utils': mockUtils as IUtils
                });
                domain.getApiKeyProperties = jest.fn().mockRejectedValue(new ValidationError({}));

                await expect(async () => domain.saveApiKey({apiKey: {...mockApiKey}, ctx: mockCtx})).rejects.toThrow(
                    ValidationError
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
                'core.infra.apiKey': mockRepo as IApiKeyRepo,
                'core.utils': mockUtils as IUtils
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
                'core.infra.apiKey': mockRepo as IApiKeyRepo,
                'core.utils': mockUtils as IUtils
            });
            domain.getApiKeyProperties = jest.fn().mockRejectedValue(new ValidationError({}));

            await expect(async () => domain.deleteApiKey({id: mockApiKey.id, ctx: mockCtx})).rejects.toThrow(
                ValidationError
            );
        });
    });
});
