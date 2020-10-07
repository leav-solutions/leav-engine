import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {AppPermissionsActions} from '../../_types/permissions';
import appPermissionDomain from './appPermissionDomain';
import * as getPermissionByUserGroups from './helpers/getPermissionByUserGroups';

jest.mock('./helpers/getDefaultPermission', () => jest.fn().mockReturnValue(false));

describe('PermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    describe('getAppPermission', () => {
        const mockAttrRepo: Mockify<IAttributeRepo> = {
            getAttributes: global.__mockPromise({
                list: [
                    {
                        id: 'user_groups',
                        linked_tree: 'users_groups'
                    }
                ],
                totalCount: 0
            })
        };
        const mockValRepo: Mockify<IValueRepo> = {
            getValues: global.__mockPromise([
                {
                    id_value: 54321,
                    value: {
                        record: {
                            id: 1,
                            library: 'users_groups'
                        }
                    }
                }
            ])
        };
        const mockTreeRepo: Mockify<ITreeRepo> = {
            getElementAncestors: global.__mockPromise([
                {
                    record: {
                        id: 1,
                        library: 'users_groups'
                    }
                },
                {
                    record: {
                        id: 2,
                        library: 'users_groups'
                    }
                },
                {
                    record: {
                        id: 3,
                        library: 'users_groups'
                    }
                }
            ])
        };

        test('Return app permission', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = appPermissionDomain({
                'core.infra.permission': mockPermRepo as IPermissionRepo,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });
            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(true));

            const perm = await permDomain.getAppPermission({
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userId: '12345',
                ctx
            });

            expect(perm).toBe(true);
        });

        test('Return default permission if nothing defined', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = appPermissionDomain({
                'core.infra.permission': mockPermRepo as IPermissionRepo,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });
            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(null));

            const perm = await permDomain.getAppPermission({
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userId: '12345',
                ctx
            });

            expect(perm).toBe(false);
        });
    });

    describe('getHeritedAppPermission', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {
            getElementAncestors: global.__mockPromise([
                {
                    record: {
                        id: 1,
                        library: 'users_groups'
                    }
                },
                {
                    record: {
                        id: 2,
                        library: 'users_groups'
                    }
                },
                {
                    record: {
                        id: 3,
                        library: 'users_groups'
                    }
                }
            ])
        };
        test('Return herited admin permission', async () => {
            const permDomain = appPermissionDomain({'core.infra.tree': mockTreeRepo as ITreeRepo});
            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(true));

            const perm = await permDomain.getHeritedAppPermission({
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(true);
        });
        test('Herit of default perm if nothing defined', async () => {
            const permDomain = appPermissionDomain({'core.infra.tree': mockTreeRepo as ITreeRepo});
            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(null));

            const perm = await permDomain.getHeritedAppPermission({
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(false);
        });
    });
});
