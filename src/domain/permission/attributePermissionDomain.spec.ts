// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {AttributePermissionsActions} from '../../_types/permissions';
import attributePermissionDomain from './attributePermissionDomain';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';

describe('AttributePermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    const defaultPerm = false;
    const mockDefaultPermHelper: Mockify<IDefaultPermissionHelper> = {
        getDefaultPermission: global.__mockPromise(defaultPerm)
    };

    describe('getAttributePermission', () => {
        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise({
                id: 'user_groups',
                linked_tree: 'users_groups'
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

        test('Return attribute permission', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const permDomain = attributePermissionDomain({
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permDomain.getAttributePermission({
                action: AttributePermissionsActions.ACCESS_ATTRIBUTE,
                attributeId: 'test_attr',
                ctx
            });

            expect(perm).toBe(true);
        });

        test('Return default permission if nothing defined', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const permDomain = attributePermissionDomain({
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permDomain.getAttributePermission({
                action: AttributePermissionsActions.ACCESS_ATTRIBUTE,
                attributeId: 'test_attr',
                ctx
            });

            expect(perm).toBe(defaultPerm);
        });
    });

    describe('getHeritedAttributePermission', () => {
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
        test('Return herited library permission', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const permDomain = attributePermissionDomain({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permDomain.getHeritedAttributePermission({
                action: AttributePermissionsActions.ACCESS_ATTRIBUTE,
                attributeId: 'test_attr',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(true);
        });

        test('Herit of default perm if nothing defined', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const permDomain = attributePermissionDomain({
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permDomain.getHeritedAttributePermission({
                action: AttributePermissionsActions.ACCESS_ATTRIBUTE,
                attributeId: 'test_attr',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(false);
        });
    });
});
