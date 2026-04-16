// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {type Stats} from 'fs';
import fs from 'fs/promises';
import {type IDbUtils} from '../db/dbUtils';
import path from 'path';

vi.mock('fs/promises');
import {type ILogger} from '@leav/logger';
import {type IConfig} from '../../_types/config';
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
        module: 'data-studio',
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
        module: 'data-studio',
    };

    describe('getApplications', () => {
        test('Get all applications', async () => {
            const mockDbServ = {execute: global.__mockPromise([])};
            const mockDbUtils = {
                findCoreEntity: global.__mockPromise([applicationData]),
            } satisfies Mockify<IDbUtils>;

            const repo = applicationRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
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
                execute: global.__mockPromise([docAppData]),
            };

            const mockCleanupRes = applicationData;
            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: vi.fn().mockReturnValue(docAppData),
            };

            const appRepo = applicationRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
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
                execute: global.__mockPromise([docAppData]),
            };

            const mockCleanupRes = applicationData;
            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: vi.fn().mockReturnValue(docAppData),
            };

            const appRepo = applicationRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
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
                execute: global.__mockPromise([docAppData]),
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockReturnValue(applicationData),
                convertToDoc: vi.fn().mockReturnValue(docAppData),
            };

            const appRepo = applicationRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
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
            applications: {rootFolder: '/some/path'},
        };

        afterAll(() => {
            vi.resetAllMocks();
        });

        test('Return modules found on directory', async () => {
            const pathSpy = vi.spyOn(path, 'resolve').mockReturnValueOnce('/some/path');
            vi.mocked(fs.readdir).mockResolvedValueOnce(['data-studio', 'admin'] as any[]);
            vi.mocked(fs.stat).mockResolvedValue({} as Stats);

            vi.mock('/some/path/data-studio/manifest.json', () => ({
                name: 'data-studio',
                description: 'data studio description',
                version: '42',
            }));

            vi.mock('/some/path/admin/manifest.json', () => ({
                name: 'admin',
                description: 'admin description',
                version: '42',
            }));

            const repo = applicationRepo({config: mockConfig as IConfig});

            const modules = await repo.getAvailableModules({ctx: mockCtx});

            expect(modules).toEqual([
                {id: 'data-studio', description: 'data studio description', version: '42'},
                {id: 'admin', description: 'admin description', version: '42'},
            ]);

            pathSpy.mockRestore();
        });

        test('Ignore invalid folders', async () => {
            const pathSpy = vi.spyOn(path, 'resolve').mockReturnValueOnce('/some/path');
            vi.mocked(fs.readdir).mockResolvedValueOnce(['data-studio', 'invalid_module'] as any[]);
            vi.mocked(fs.stat).mockImplementation(statPath => {
                if (String(statPath).match(/invalid_module/)) {
                    throw new Error('Invalid module');
                }
                return Promise.resolve({} as Stats);
            });

            vi.mock('/some/path/data-studio/manifest.json', () => ({
                name: 'data-studio',
                description: 'data studio description',
                version: '42',
            }));

            const mockLogger: Mockify<ILogger> = {
                warn: vi.fn(),
            };

            const repo = applicationRepo({
                'core.utils.logger': mockLogger as ILogger,
                config: mockConfig as IConfig,
            });

            const modules = await repo.getAvailableModules({ctx: mockCtx});

            expect(modules).toEqual([{id: 'data-studio', description: 'data studio description', version: '42'}]);

            pathSpy.mockRestore();
        });
    });
});
