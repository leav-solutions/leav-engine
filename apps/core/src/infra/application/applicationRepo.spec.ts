// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {Stats} from 'fs';
import fs from 'fs/promises';
import {IDbUtils} from 'infra/db/dbUtils';
import path from 'path';
import winston from 'winston';
import {IConfig} from '_types/config';
import {mockApplication} from '../../__tests__/mocks/application';
import {mockCtx} from '../../__tests__/mocks/shared';
import applicationRepo from './applicationRepo';

describe('applicationRepo', () => {
    const docAppData = {
        _key: 'test_application',
        type: 'internal',
        system: true,
        label: {fr: 'Test'},
        endpoint: 'my-application',
        description: 'Super application',
        libraries: ['products', 'categories'],
        color: 'orange',
        module: 'data-studio'
    };
    const applicationData = {
        ...mockApplication,
        id: 'test_application',
        system: true,
        label: {fr: 'Test'},
        endpoint: 'my-application',
        description: {fr: 'Super application'},
        libraries: ['products', 'categories'],
        trees: ['files', 'categories'],
        color: 'orange',
        module: 'data-studio'
    };

    describe('getApplications', () => {
        test('Get all applications', async () => {
            const mockDbServ = {db: null, execute: global.__mockPromise([])};
            const mockDbUtils: Mockify<IDbUtils> = {
                findCoreEntity: global.__mockPromise([applicationData])
            };

            const repo = applicationRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const trees = await repo.getApplications({ctx: mockCtx});

            expect(mockDbUtils.findCoreEntity.mock.calls.length).toBe(1);
            expect(trees).toEqual([applicationData]);
        });
    });

    describe('createApplication', () => {
        test('Create new application', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docAppData])
            };

            const mockCleanupRes = applicationData;
            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue(docAppData)
            };

            const appRepo = applicationRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const createdAttr = await appRepo.createApplication({applicationData, ctx: mockCtx});
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(createdAttr).toMatchObject(applicationData);
        });
    });

    describe('updateApplication', () => {
        test('Update application', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docAppData])
            };

            const mockCleanupRes = applicationData;
            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue(docAppData)
            };

            const appRepo = applicationRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const updatedApp = await appRepo.updateApplication({applicationData, ctx: mockCtx});
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(updatedApp).toMatchObject(applicationData);
        });
    });

    describe('deleteApplication', () => {
        test('Delete application', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docAppData])
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(applicationData),
                convertToDoc: jest.fn().mockReturnValue(docAppData)
            };

            const appRepo = applicationRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            await appRepo.deleteApplication({id: applicationData.id, ctx: mockCtx});

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object');
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });
    });

    describe('getAvailableModules', () => {
        const mockConfig: Mockify<IConfig> = {
            applications: {rootFolder: '/some/path'}
        };

        afterAll(() => {
            jest.resetAllMocks();
        });

        test('Return modules found on directory', async () => {
            const pathSpy = jest.spyOn(path, 'resolve').mockReturnValueOnce('/some/path');
            const fsSpy = jest.spyOn(fs, 'readdir').mockResolvedValueOnce(['data-studio', 'admin'] as any[]);
            const fsSpyStat = jest.spyOn(fs, 'stat').mockResolvedValue({} as Stats);

            jest.mock(
                '/some/path/data-studio/manifest.json',
                () => ({
                    name: 'data-studio',
                    description: 'data studio description',
                    version: '42'
                }),
                {virtual: true}
            );

            jest.mock(
                '/some/path/admin/manifest.json',
                () => ({
                    name: 'admin',
                    description: 'admin description',
                    version: '42'
                }),
                {virtual: true}
            );

            const repo = applicationRepo({config: mockConfig as IConfig});

            const modules = await repo.getAvailableModules({ctx: mockCtx});

            expect(modules).toEqual([
                {id: 'data-studio', description: 'data studio description', version: '42'},
                {id: 'admin', description: 'admin description', version: '42'}
            ]);

            pathSpy.mockRestore();
            fsSpy.mockRestore();
            fsSpyStat.mockRestore();
        });

        test('Ignore invalid folders', async () => {
            const pathSpy = jest.spyOn(path, 'resolve').mockReturnValueOnce('/some/path');
            const fsSpy = jest.spyOn(fs, 'readdir').mockResolvedValueOnce(['data-studio', 'invalid_module'] as any[]);
            const fsSpyStat = jest.spyOn(fs, 'stat').mockImplementation(statPath => {
                if (String(statPath).match(/invalid_module/)) {
                    throw new Error('Invalid module');
                }
                return Promise.resolve({} as Stats);
            });

            jest.mock(
                '/some/path/data-studio/manifest.json',
                () => ({
                    name: 'data-studio',
                    description: 'data studio description',
                    version: '42'
                }),
                {virtual: true}
            );

            const mockLogger: Mockify<winston.Winston> = {
                warn: jest.fn()
            };

            const repo = applicationRepo({
                'core.utils.logger': mockLogger as winston.Winston,
                config: mockConfig as IConfig
            });

            const modules = await repo.getAvailableModules({ctx: mockCtx});

            expect(modules).toEqual([{id: 'data-studio', description: 'data studio description', version: '42'}]);

            pathSpy.mockRestore();
            fsSpy.mockRestore();
            fsSpyStat.mockRestore();
        });
    });
});
