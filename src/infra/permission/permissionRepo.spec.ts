import {RecordPermissions, PermissionTypes} from '../../_types/permissions';
import permissionRepo from './permissionRepo';
import {IDbUtils} from '../db/dbUtils';
import {Database} from 'arangojs';

describe('PermissionRepo', () => {
    describe('SavePermission', () => {
        test('Should save permission', async () => {
            const permData = {
                type: PermissionTypes.RECORD,
                usersGroup: 'users/12345',
                actions: {
                    [RecordPermissions.ACCESS]: true,
                    [RecordPermissions.EDIT]: false,
                    [RecordPermissions.DELETE]: false
                },
                target: 'test_lib/12345'
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
                        target: {
                            id: '123',
                            library: 'category',
                            tree: 'categories'
                        },
                        type: 'RECORD',
                        usersGroup: '12345'
                    }
                ])
            };
            const permRepo = permissionRepo(mockDbServ);

            const perm = await permRepo.getPermissions(PermissionTypes.RECORD, 12345, {
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

            const perm = await permRepo.getPermissions(PermissionTypes.RECORD, 12345, {
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
