// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {IApiKey} from '_types/apiKey';
import {mockCtx} from '../../__tests__/mocks/shared';
import apiKeyRepo from './apiKeyRepo';

describe('apiKeyRepo', () => {
    const docKeyData = {
        _key: 'test_key',
        label: {fr: 'Test'},
        trees: ['treeA', 'treeB']
    };

    const keyData: IApiKey = {
        id: 'test_key',
        label: 'Test',
        key: 'test_key',
        userId: '42',
        expiresAt: null,
        createdAt: 1234567890,
        createdBy: '42',
        modifiedAt: 1234567890,
        modifiedBy: '42'
    };

    const mockDbUtils: Mockify<IDbUtils> = {
        cleanup: jest.fn().mockReturnValue(keyData),
        convertToDoc: jest.fn().mockReturnValue(docKeyData),
        findCoreEntity: global.__mockPromise([keyData])
    };

    describe('createApiKey', () => {
        test('Should create a new version key', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docKeyData])
            };

            const repo = apiKeyRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const createdKey = await repo.createApiKey({keyData, ctx: mockCtx});
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(createdKey).toMatchObject(keyData);
        });
    });

    describe('updateApiKey', () => {
        test('Should update an existing version key', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docKeyData])
            };

            const repo = apiKeyRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const updatedKey = await repo.updateApiKey({keyData, ctx: mockCtx});
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(updatedKey).toMatchObject(keyData);
        });
    });

    describe('getApiKeys', () => {
        test('Should return a list of version keys', async () => {
            const mockDbServ = {db: null, execute: global.__mockPromise([])};

            const repo = apiKeyRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const keys = await repo.getApiKeys({ctx: mockCtx});

            expect(mockDbUtils.findCoreEntity.mock.calls.length).toBe(1);
            expect(keys).toEqual([keyData]);
        });
    });

    describe('Delete ApiKey', () => {
        test('Should delete a version key', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docKeyData])
            };

            const repo = apiKeyRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const deletedKey = await repo.deleteApiKey({id: keyData.id, ctx: mockCtx});

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(deletedKey).toMatchObject(keyData);
        });
    });
});
