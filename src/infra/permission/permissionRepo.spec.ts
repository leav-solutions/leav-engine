import {RecordPermissions, PermissionTypes, IPermission} from '../../_types/permissions';
import permissionRepo from './permissionRepo';
import {IDbUtils} from '../db/dbUtils';
import {Database} from 'arangojs';

describe('PermissionRepo', () => {
    describe('SavePermission', () => {
        test('Should save permission', async () => {
            const permData: IPermission = {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroup: '12345',
                actions: {
                    [RecordPermissions.ACCESS]: true,
                    [RecordPermissions.EDIT]: false,
                    [RecordPermissions.DELETE]: false
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
                cleanup: jest.fn().mockReturnValue(permData)
            };

            const permRepo = permissionRepo(mockDbServ, mockDbUtils as IDbUtils);

            const savedPerm = await permRepo.savePermission(permData);

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/UPSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(savedPerm).toMatchObject(permData);
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
