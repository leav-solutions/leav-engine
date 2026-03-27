// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IConfig} from '../../../_types/config';
import defaultPermission from './defaultPermission';
import {adminsGroupId, systemUserId} from '../../../_constants/users';
import {
    AdminPermissionsActions,
    ApplicationPermissionsActions,
    LibraryPermissionsActions,
    PermissionTypes,
    RecordPermissionsActions,
} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type TreePath} from '../../../_types/tree';

describe('getDefaultPermission', () => {
    const config: IConfig = {
        permissions: {
            everybody: {
                default: true,
                admin: {
                    default: false,
                },
                application: {
                    admin_application: false,
                },
            },
            adminGroup: {
                default: true,
                record: {
                    delete_record: false,
                },
            },
        },
    } as IConfig;

    const defaultPermHelper = defaultPermission({config});
    const ctx: IQueryInfos = {userId: '123'};

    describe('for everybody', () => {
        const userGroups: TreePath[] = [];
        test('with action not defined in config should return default', () => {
            const perm = defaultPermHelper.getDefaultPermission({
                type: PermissionTypes.LIBRARY,
                action: LibraryPermissionsActions.ACCESS_LIBRARY,
                userGroups,
                ctx,
            });

            expect(perm).toBe(config.permissions.everybody.default);
        });
        test('with action ACCESS_APPLICATION not defined in config permission type APPLICATION should return default', async () => {
            const perm = defaultPermHelper.getDefaultPermission({
                type: PermissionTypes.APPLICATION,
                action: ApplicationPermissionsActions.ACCESS_APPLICATION,
                userGroups,
                ctx,
            });

            expect(perm).toBe(config.permissions.everybody.default);
        });
        test('with action ADMIN_APPLICATION and type APPLICATION defined in config should return it', async () => {
            const perm = defaultPermHelper.getDefaultPermission({
                type: PermissionTypes.APPLICATION,
                action: ApplicationPermissionsActions.ADMIN_APPLICATION,
                userGroups,
                ctx,
            });

            expect(perm).toBe(config.permissions.everybody.application?.admin_application);
        });
        test('with type defined in config and not action should return default for type ', async () => {
            const perm = defaultPermHelper.getDefaultPermission({
                type: PermissionTypes.ADMIN,
                action: AdminPermissionsActions.CREATE_LIBRARY,
                userGroups,
                ctx,
            });

            expect(perm).toBe(config.permissions.everybody.admin?.default);
        });
    });

    describe('for admin group', () => {
        const userGroups: TreePath[] = [[{id: adminsGroupId}]];
        test('with action not defined in config should return default', () => {
            const perm = defaultPermHelper.getDefaultPermission({
                type: PermissionTypes.LIBRARY,
                action: LibraryPermissionsActions.ACCESS_LIBRARY,
                userGroups,
                ctx,
            });

            expect(perm).toBe(config.permissions.adminGroup.default);
        });
        test('with action ACCESS_RECORD not defined in config permission type RECORD should return default', async () => {
            const perm = defaultPermHelper.getDefaultPermission({
                type: PermissionTypes.RECORD,
                action: RecordPermissionsActions.ACCESS_RECORD,
                userGroups,
                ctx,
            });

            expect(perm).toBe(config.permissions.adminGroup.default);
        });
        test('with action and type defined in config should return it', async () => {
            const perm = defaultPermHelper.getDefaultPermission({
                type: PermissionTypes.RECORD,
                action: RecordPermissionsActions.DELETE_RECORD,
                userGroups,
                ctx,
            });

            expect(perm).toBe(config.permissions.adminGroup.record?.delete_record);
        });
    });

    describe('for system user', () => {
        test('should always return true', async () => {
            const perm = defaultPermHelper.getDefaultPermission({
                type: PermissionTypes.RECORD,
                action: RecordPermissionsActions.DELETE_RECORD,
                userGroups: [],
                ctx: {userId: systemUserId},
            });

            expect(perm).toBe(true);
        });
    });
});
