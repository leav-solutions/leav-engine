// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {AppPermissionsActions} from '../../_types/permissions';
import appPermissionDomain from './appPermissionDomain';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';

describe('PermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    const mockDefaultPermHelper: Mockify<IDefaultPermissionHelper> = {
        getDefaultPermission: global.__mockPromise(false)
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
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const permDomain = appPermissionDomain({
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permDomain.getAppPermission({
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userId: '12345',
                ctx
            });

            expect(perm).toBe(true);
        });

        test('Return default permission if nothing defined', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};

            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const permDomain = appPermissionDomain({
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.permission': mockPermRepo as IPermissionRepo,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

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
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const permDomain = appPermissionDomain({
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permDomain.getHeritedAppPermission({
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(true);
        });
        test('Herit of default perm if nothing defined', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const permDomain = appPermissionDomain({
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permDomain.getHeritedAppPermission({
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(false);
        });
    });
});
