import {Database} from 'arangojs';
import {IPermission, PermissionTypes, RecordPermissionsActions} from '../../_types/permissions';
import {IDbUtils} from '../db/dbUtils';
import permissionRepo from './permissionRepo';

describe('PermissionRepo', () => {
    describe('SavePermission', () => {
        test('Should save permission', async () => {
            const permData = {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroup: '12345',
                actions: {
                    [RecordPermissionsActions.ACCESS]: true,
                    [RecordPermissionsActions.EDIT]: false,
                    [RecordPermissionsActions.DELETE]: false
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
                    [RecordPermissionsActions.ACCESS]: true,
                    [RecordPermissionsActions.EDIT]: false,
                    [RecordPermissionsActions.DELETE]: false
                },
                permissionTreeTarget: {
                    id: 123445,
                    library: 'test_lib',
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

            const permRepo = permissionRepo(mockDbServ, mockDbUtils as IDbUtils);

            const savedPerm = await permRepo.savePermission(permDataClean);

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/UPSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

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
            const permRepo = permissionRepo(mockDbServ);

            const perm = await permRepo.getPermissions(PermissionTypes.RECORD, 'test_lib', 12345, {
                id: '123',
                library: 'category',
                tree: 'categories'
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/(?!FILTER)/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });

        test('Should return null if no permissions', async () => {
            const mockDbServ = {db: new Database(), execute: global.__mockPromise([])};
            const permRepo = permissionRepo(mockDbServ);

            const perm = await permRepo.getPermissions(PermissionTypes.RECORD, 'test_lib', 12345, {
                id: '123',
                library: 'category',
                tree: 'categories'
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(perm).toBe(null);
        });
    });
});
