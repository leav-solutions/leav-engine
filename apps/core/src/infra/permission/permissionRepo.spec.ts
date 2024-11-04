// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {IQueryInfos} from '_types/queryInfos';
import {IPermission, PermissionTypes, RecordPermissionsActions} from '../../_types/permissions';
import {IDbUtils} from '../db/dbUtils';
import permissionRepo from './permissionRepo';

describe('PermissionRepo', () => {
    const ctx: IQueryInfos = {
        userId: '0',
        queryId: '123456'
    };
    describe('SavePermission', () => {
        test('Should save permission', async () => {
            const permData = {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroup: '12345',
                actions: {
                    [RecordPermissionsActions.ACCESS_RECORD]: true,
                    [RecordPermissionsActions.EDIT_RECORD]: false,
                    [RecordPermissionsActions.DELETE_RECORD]: false
                },
                permissionTreeTarget: {
                    id: 'test_lib/123445',
                    tree: 'test_tree'
                }
            };

            const permDataClean: IPermission = {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroup: '12345',
                actions: {
                    [RecordPermissionsActions.ACCESS_RECORD]: true,
                    [RecordPermissionsActions.EDIT_RECORD]: false,
                    [RecordPermissionsActions.DELETE_RECORD]: false
                },
                permissionTreeTarget: {
                    nodeId: '123445',
                    tree: 'test_tree'
                }
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([permData])
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(permDataClean)
            };

            const permRepo = permissionRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const savedPerm = await permRepo.savePermission({permData: permDataClean, ctx});

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(savedPerm).toMatchObject(permDataClean);
        });

        test('Save permissions on root user group', async () => {
            const permData = {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroup: null,
                actions: {
                    [RecordPermissionsActions.ACCESS_RECORD]: true,
                    [RecordPermissionsActions.EDIT_RECORD]: false,
                    [RecordPermissionsActions.DELETE_RECORD]: false
                },
                permissionTreeTarget: {
                    id: 'test_lib/123445',
                    tree: 'test_tree'
                }
            };

            const permDataClean: IPermission = {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroup: null,
                actions: {
                    [RecordPermissionsActions.ACCESS_RECORD]: true,
                    [RecordPermissionsActions.EDIT_RECORD]: false,
                    [RecordPermissionsActions.DELETE_RECORD]: false
                },
                permissionTreeTarget: {
                    nodeId: '123445',
                    tree: 'test_tree'
                }
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([{...permData, usersGroup: 'core_trees/users_groups'}])
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(permDataClean)
            };

            const permRepo = permissionRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const savedPerm = await permRepo.savePermission({permData: permDataClean, ctx});

            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars.value0.usersGroup).toBe(null);
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars.value1.usersGroup).toBe(null);
            expect(mockDbUtils.cleanup.mock.calls[0][0].usersGroup).toBe(null);

            expect(savedPerm).toMatchObject(permDataClean);
        });

        test('Save permissions on tree root', async () => {
            const permData = {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroup: '12345',
                actions: {
                    [RecordPermissionsActions.ACCESS_RECORD]: true,
                    [RecordPermissionsActions.EDIT_RECORD]: false,
                    [RecordPermissionsActions.DELETE_RECORD]: false
                },
                permissionTreeTarget: {
                    nodeId: null,
                    tree: 'test_tree'
                }
            };

            const permDataClean: IPermission = {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroup: null,
                actions: {
                    [RecordPermissionsActions.ACCESS_RECORD]: true,
                    [RecordPermissionsActions.EDIT_RECORD]: false,
                    [RecordPermissionsActions.DELETE_RECORD]: false
                },
                permissionTreeTarget: {
                    nodeId: null,
                    tree: 'test_tree'
                }
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([permData])
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(permDataClean)
            };

            const permRepo = permissionRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const savedPerm = await permRepo.savePermission({permData: permDataClean, ctx});

            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars.value0.permissionTreeTarget).toMatchObject({
                nodeId: null,
                tree: 'test_tree'
            });

            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars.value1.permissionTreeTarget).toMatchObject({
                nodeId: null,
                tree: 'test_tree'
            });

            expect(savedPerm).toMatchObject(permDataClean);
        });
    });
    describe('GetPermissions', () => {
        test('Should return a permission', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        actions: {
                            ACCESS: true,
                            EDIT: true
                        },
                        permissionTreeTarget: {
                            id: '123',
                            library: 'category',
                            tree: 'categories'
                        },
                        type: 'RECORD',
                        applyTo: 'test_lib',
                        usersGroup: '12345'
                    }
                ])
            };
            const permRepo = permissionRepo({'core.infra.db.dbService': mockDbServ});

            const perm = await permRepo.getPermissions({
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroupNodeId: '12345',
                permissionTreeTarget: {
                    nodeId: '123',
                    tree: 'categories'
                },
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/(?!FILTER)/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });

        test('Should return null if no permissions', async () => {
            const mockDbServ = {db: new Database(), execute: global.__mockPromise([])};
            const permRepo = permissionRepo({'core.infra.db.dbService': mockDbServ});

            const perm = await permRepo.getPermissions({
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroupNodeId: '12345',
                permissionTreeTarget: {
                    nodeId: '123',
                    tree: 'categories'
                },
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(perm).toBe(null);
        });
    });
});
